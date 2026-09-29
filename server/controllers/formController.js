const { catchAsync, AppError } = require('../middleware/errorsMiddleware');
const Form = require('../models/FormModel');
const { deriveFieldIds, describeFieldIdProblems } = require('../utils/fieldId');
const { assertIdentityFields } = require('../utils/fieldIdentity');
const { renderCustomSubmissionEmail } = require('../utils/sendEmail');
const {
  SAMPLE_MEMBER,
  SAMPLE_NAME,
  SAMPLE_TICKET_CODE,
  buildSampleSubmissions,
  findUnresolved,
} = require('../utils/emailPreview');
const QRCode = require('qrcode');

// Keep in sync with the `maxlength` on the Form schema, so an over-long value is
// refused with a useful message instead of a Mongoose ValidationError.
const EMAIL_SUBJECT_MAX = 200;
const EMAIL_BODY_MAX = 5000;

/**
 * Reject a field list that cannot produce usable, unique answer keys.
 *
 * Field ids are derived from labels (see utils/fieldId.js) and are what every
 * answer is stored under, so a label that slugs to nothing, or two labels that
 * slug to the same id, has to be refused up front. Previously these were only
 * caught deep inside Mongoose as a generic 500.
 *
 * @param {Array} fields
 */
function assertUsableFieldIds(fields) {
  const { emptyLabels, duplicates } = deriveFieldIds(fields);
  if (emptyLabels.length === 0 && duplicates.length === 0) return;

  throw new AppError(describeFieldIdProblems({ emptyLabels, duplicates }), 400, 'INVALID_FIELD_IDS');
}

/**
 * Read a boolean setting off a request body.
 *
 * Only a real boolean is accepted. The string "false" is truthy in JavaScript,
 * so a loose cast would silently switch a feature on, and an absent key has to
 * mean "leave it alone" so a partial update cannot reset it.
 *
 * @param {object} body
 * @param {string} key
 * @param {string} code  error code for a non-boolean value
 * @param {boolean|undefined} [fallback] value used when `key` is absent
 * @returns {boolean|undefined} undefined when the key is absent
 */
function readBooleanSetting(body, key, code, fallback = undefined) {
  const value = body[key];
  if (value === undefined || value === null) return fallback;
  if (typeof value !== 'boolean') {
    throw new AppError(`${key} must be true or false`, 400, code);
  }
  return value;
}

/**
 * Validate the author-written post-submission email settings.
 *
 * Shared by createForm and updateFormSettings so both reject the same mistakes.
 * `existing` carries the values already on the form, which matters for a partial
 * update: switching `sendEmailOnSubmission` on has to be checked against the
 * body already stored, not against an empty string.
 *
 * @param {object} body
 * @param {object} [existing] currently stored form values
 * @returns {object} only the keys present in `body`, plus the derived default
 */
function readSubmissionEmailSettings(body, existing = {}) {
  const out = {};

  const sendEmailOnSubmission = readBooleanSetting(
    body,
    'sendEmailOnSubmission',
    'INVALID_SEND_EMAIL_ON_SUBMISSION',
    undefined
  );
  if (sendEmailOnSubmission !== undefined) {
    out.sendEmailOnSubmission = sendEmailOnSubmission;
  }

  if (body.submissionEmailSubject !== undefined && body.submissionEmailSubject !== null) {
    if (typeof body.submissionEmailSubject !== 'string') {
      throw new AppError('submissionEmailSubject must be text', 400, 'INVALID_EMAIL_SUBJECT');
    }
    if (body.submissionEmailSubject.length > EMAIL_SUBJECT_MAX) {
      throw new AppError(
        `The email subject must be ${EMAIL_SUBJECT_MAX} characters or fewer`,
        400,
        'EMAIL_SUBJECT_TOO_LONG'
      );
    }
    out.submissionEmailSubject = body.submissionEmailSubject.trim();
  }

  if (body.submissionEmailBody !== undefined && body.submissionEmailBody !== null) {
    if (typeof body.submissionEmailBody !== 'string') {
      throw new AppError('submissionEmailBody must be text', 400, 'INVALID_EMAIL_BODY');
    }
    if (body.submissionEmailBody.length > EMAIL_BODY_MAX) {
      throw new AppError(
        `The email body must be ${EMAIL_BODY_MAX} characters or fewer`,
        400,
        'EMAIL_BODY_TOO_LONG'
      );
    }
    out.submissionEmailBody = body.submissionEmailBody.trim();
  }

  // Switching the feature on with nothing to send would mail every submitter a
  // blank page, so require the message at the moment it is enabled. Turning it
  // off keeps the stored text, so re-enabling does not lose the author's work.
  const enabled = out.sendEmailOnSubmission ?? existing.sendEmailOnSubmission;
  const bodyText = out.submissionEmailBody ?? existing.submissionEmailBody;
  if (enabled && !bodyText) {
    throw new AppError(
      'Write the email you want to send, or turn off "Email after submission"',
      400,
      'EMPTY_EMAIL_BODY'
    );
  }

  return out;
}

// @desc    Create a new form
// @route   POST /api/forms
// @access  Private (Admin)
const createForm = catchAsync(async (req, res) => {
  const { title, description, fields, type, startDate, endDate, maxSubmissions } = req.body;

  if (!title || !type) {
    throw new AppError("Title and Type are required", 400);
  }

  // Check the type against the schema's own enum so there is a single source of
  // truth. Without this an unsupported type only fails later inside Mongoose and
  // surfaces as an opaque 500.
  const allowedTypes = Form.schema.path('type').enumValues;
  if (!allowedTypes.includes(type)) {
    throw new AppError(
      `"${type}" is not a valid form type. Expected one of: ${allowedTypes.join(', ')}.`,
      400,
      'INVALID_FORM_TYPE'
    );
  }

  // A form with no fields is never intentional and cannot be submitted
  // (submitForm requires a name field), so say so rather than silently
  // substituting a default. `fields` being absent entirely still falls back to
  // the default below, which keeps older clients working.
  if (fields !== undefined && (!Array.isArray(fields) || fields.length === 0)) {
    throw new AppError("A form needs at least one field", 400, 'NO_FIELDS');
  }

  // A form with no field list still has to be submittable, and submitForm needs a
  // name and an email. This fallback used to be Full Name alone, which produced a
  // form nobody could submit to.
  const resolvedFields = fields || [
    { label: "Full Name", type: "TextInput", required: true },
    { label: "Email", type: "TextInput", required: true }
  ];

  assertUsableFieldIds(resolvedFields);

  // A name and an email are not optional extras: submitForm rejects a submission
  // without them, and the ticket QR, the confirmation email and the submissions
  // export are all keyed on them. Catch it here so the builder gets told.
  assertIdentityFields(resolvedFields, AppError);

  // `requiresLogin` decides who may submit, and is enforced in submitForm. It was
  // never read from the request, so the flag was unreachable and always fell back
  // to the schema default.
  const requiresLogin = readBooleanSetting(req.body, 'requiresLogin', 'INVALID_REQUIRES_LOGIN', false);

  // Optional custom email to send after a submission. Same validation as the
  // edit path, so a form cannot be created in a state the editor would reject.
  const emailSettings = readSubmissionEmailSettings(req.body);

  const defaultstartDate = new Date();
  const defaultendDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default to 1 week from now
  const form = await Form.create({
    title,
    description,
    fields: resolvedFields,
    type,
    requiresLogin,
    ...emailSettings,
    startDate: startDate || defaultstartDate,
    endDate: endDate || defaultendDate,
    maxSubmissions,
    createdBy: req.user._id
  });

  res.status(201).json(form);
});

// @desc    Get a single form by ID (Public view for students)
// @route   GET /api/form/:id
// @access  Public
const getForm = catchAsync(async (req, res) => {
  const form = await Form.findById(req.params.id);

    if (!form) {
      throw new AppError('Form not found', 404);
    }

    // Check if form is Active
    if (new Date(form.endDate).setHours(23,59,59,999) < new Date() || form.status !== "Active") {
      throw new AppError('This form is currently closed.', 400);
    }

    res.json(form);
});

// @desc    Get ALL forms (For Admin Dashboard Table)
// @route   GET /api/form/all
// @access  Private (Admin)
const getForms = catchAsync(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Sort by newest first
  const [result] = await Form.aggregate([
    {
      $facet: {
        forms: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
        ],

        totalCount: [
          { $count: "count" }
        ],

        draftCount: [
          { $match: { status: "Draft" } },
          { $count: "count" }
        ],

        closedCount: [
          { $match: { status: "Closed" } },
          { $count: "count" }
        ],

        activeCount: [
          { $match: { status: "Active" } },
          { $count: "count" }
        ]
      }
    }
  ]);

  const forms = result.forms;
  const count = result.totalCount[0]?.count || 0;
  const draftCount = result.draftCount[0]?.count || 0;
  const closedCount = result.closedCount[0]?.count || 0;
  const activeCount = result.activeCount[0]?.count || 0;
  
  res.json({
    count,
    draftCount,
    closedCount,
    activeCount,
    forms,
    pagination: {
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      itemsPerPage: limit,
    },
  });
});

// @desc    Delete a form
// @route   DELETE /api/forms/:id
// @access  Private (Admin)
const deleteForm = catchAsync(async (req, res) => {
  const form = await Form.findById(req.params.id);

    if (!form) {
      throw new AppError('Form not found', 404);
    }

    // Optional: Check if the user is the one who created it OR is a super admin
    // if (form.createdBy.toString() !== req.user._id.toString()) ...

    await form.deleteOne();
    res.json({ message: 'Form removed' });
});

// @desc    Toggle Form Status (Open/Close manually)
// @route   PUT /api/forms/:id/toggle
// @access  Private (Admin)
const toggleFormStatus = catchAsync(async (req, res) => {
  const form = await Form.findById(req.params.id);
    if (!form) throw new AppError('Form not found', 404);

    form.status = form.status === 'Active' ? 'Closed' : 'Active';
    await form.save();

    res.json({ message: `Form is now ${form.status}` });
});

// @desc    Update a form's settings
// @route   PUT /api/form/:id/settings
// @access  Private (Admin)
const updateFormSettings = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate, maxSubmissions } = req.body;

  // Read the form first instead of relying on findByIdAndUpdate's return value.
  // The stored values are needed to judge a partial update: enabling the custom
  // email is only valid against the body already saved, and the date range has
  // to be checked against the dates that will actually result from the merge.
  // It also lets a missing form answer 404 instead of falling through.
  const existing = await Form.findById(id).lean();
  if (!existing) throw new AppError('Form not found', 404);

  const updateFields = {};

  if (startDate !== undefined) updateFields.startDate = startDate;
  if (endDate !== undefined) updateFields.endDate = endDate;
  if (maxSubmissions !== undefined) updateFields.maxSubmissions = maxSubmissions;

  // Every key is optional, so a request that changes only the login setting
  // cannot accidentally blank the dates.
  const requiresLogin = readBooleanSetting(req.body, 'requiresLogin', 'INVALID_REQUIRES_LOGIN', undefined);
  if (requiresLogin !== undefined) updateFields.requiresLogin = requiresLogin;

  // Lets an existing form switch the post-submission email on or off, change the
  // wording, and turn `requiresLogin` on after the fact.
  Object.assign(updateFields, readSubmissionEmailSettings(req.body, existing));

  if (Object.keys(updateFields).length === 0) {
    throw new AppError('No settings were provided to update', 400, 'NO_SETTINGS');
  }

  // Compare the merged result, not just the two values that happen to be in this
  // request. Moving only endDate before the existing startDate used to slip
  // through and produce a form nobody can submit to.
  const effectiveStart = new Date(updateFields.startDate ?? existing.startDate);
  const effectiveEnd = new Date(updateFields.endDate ?? existing.endDate);
  if (effectiveStart > effectiveEnd) {
    throw new AppError('startDate must be before endDate', 400, 'INVALID_DATE_RANGE');
  }

  const updatedForm = await Form.findByIdAndUpdate(
    id,
    { $set: updateFields },
    { returnDocument: 'after', runValidators: true }
  );

  if (!updatedForm) throw new AppError('Form not found', 404);

  res.status(200).json({
    message: 'Form settings updated successfully',
    form: updatedForm
  });
});

// Render a form's submission email without sending it, for the builder preview.
//
// The message goes through renderCustomSubmissionEmail, the same function
// sendCustomSubmissionEmail calls, so the preview is the real message rather
// than a reimplementation that can drift. Two renderings come back: one as a
// registered member and one as a guest, because db-user[...] resolves for the
// first and stays as literal text for the second, and an author cannot see that
// difference any other way.
const previewSubmissionEmail = catchAsync(async (req, res) => {
  const { formTitle, formType, fields, asGuest, subject, messageBody } = req.body || {};

  if (formTitle !== undefined && typeof formTitle !== 'string') {
    throw new AppError('formTitle must be text', 400, 'INVALID_FORM_TITLE');
  }
  if (formType !== undefined && typeof formType !== 'string') {
    throw new AppError('formType must be text', 400, 'INVALID_FORM_TYPE');
  }
  if (subject !== undefined && typeof subject !== 'string') {
    throw new AppError('subject must be text', 400, 'INVALID_EMAIL_SUBJECT');
  }
  if (messageBody !== undefined && typeof messageBody !== 'string') {
    throw new AppError('messageBody must be text', 400, 'INVALID_EMAIL_BODY');
  }
  if (fields !== undefined && !Array.isArray(fields)) {
    throw new AppError('fields must be a list', 400, 'INVALID_FIELDS');
  }

  const title = (formTitle || '').trim() || 'Untitled form';
  const safeFields = Array.isArray(fields) ? fields : [];
  const asMember = asGuest !== true;

  // The QR is generated for real, from a sample code, so the author sees the
  // actual block a ticket produces rather than a mocked rectangle. Only
  // attendance forms ever carry one.
  const hasQr = formType === 'attendance';
  const qrDataUrl = hasQr ? await QRCode.toDataURL(SAMPLE_TICKET_CODE) : null;

  const dbSubmissions = buildSampleSubmissions(safeFields);
  dbSubmissions.formTitle = title;
  dbSubmissions.formType = formType || '';

  const base = {
    subject: subject || `We received your submission for ${title}`,
    messageBody: messageBody || '',
    formTitle: title,
    userName: SAMPLE_NAME,
    ticketCode: SAMPLE_TICKET_CODE,
    qrDataUrl,
    dbSubmissions,
  };

  // The member case fills db-user[...]; the guest case passes no account, which
  // is exactly what the controller does for an unregistered submitter.
  // dbSubmissions carries the same reserved values the renderer merges in, so
  // asking "would this resolve?" here gives the same answer the renderer does.
  const reportSubmissions = {
    ...dbSubmissions,
    ...(qrDataUrl ? { qrurl: qrDataUrl, qrcode: qrDataUrl } : {}),
  };
  const memberContext = { dbUser: SAMPLE_MEMBER, dbSubmissions: reportSubmissions };
  const guestContext = { dbUser: null, dbSubmissions: reportSubmissions };

  const member = renderCustomSubmissionEmail({ ...base, dbUser: SAMPLE_MEMBER });
  const guest = asMember
    ? member
    : renderCustomSubmissionEmail({ ...base, dbUser: null });

  const subjectAndBody = `${base.subject}\n${base.messageBody}`;

  // On a form with no QR the sender drops db-submissions[qrCode] rather than
  // resolving it, so it is not an author mistake and is not reported as one.
  const withoutStrippedQr = (list) =>
    hasQr
      ? list
      : list.filter((p) => !['qrcode', 'qrurl'].includes(p.key.toLowerCase()));

  res.status(200).json({
    subject: asMember ? member.subject : guest.subject,
    member: member.html,
    guest: guest.html,
    // For the member view, these are the placeholders a real member would also
    // see as raw text: a misspelt name, or a field deleted after the message
    // was written.
    unresolved: asMember
      ? withoutStrippedQr(findUnresolved(subjectAndBody, memberContext)).map((p) => p.token)
      : [],
    // A guest cannot fill db-user[...] at all, so those are expected rather than
    // a mistake. Only flag them so the UI can explain rather than alarm.
    guestUnresolved: asMember
      ? []
      : withoutStrippedQr(findUnresolved(subjectAndBody, guestContext))
          .filter((p) => p.scope === 'db-user')
          .map((p) => p.token),
  });
});

module.exports = { 
  createForm, 
  getForm, 
  getForms, 
  deleteForm,
  toggleFormStatus,
  updateFormSettings,
  previewSubmissionEmail,
  // Exported for the verification script and for reuse by other controllers.
  readBooleanSetting,
  readSubmissionEmailSettings,
  EMAIL_SUBJECT_MAX,
  EMAIL_BODY_MAX
};

/*
== known gaps (see the repo analysis) ==

`requiresLogin`, `sendEmailOnSubmission` and the custom email subject/body are all
settable here, and `requiresLogin` is enforced by `submitForm`. The builder's
edit modal is the only place that can change them; there is still no way to
change `fields` or `type` after a form exists.

`activityID` is not marked unique in FormModel, so forms created without one
are fine today — the concern in the original review does not apply.
*/
