// This file holds all your static HTML parts

const LOGO_URL = 'https://i.ibb.co/p6ZC1kT1/ieeesha-black-logo.png';
const LOGO_ALT = 'IEEE El Shorouk Academy Student Branch';

// The footer is only the 600px card. The page background, the gutter and the
// document scaffolding are supplied by buildEmailDocument() so that every email
// — template or bulk — shares one wrapper and the two cards always line up.
const getFooterCard = () => {
  const logoCell = `<td
         width="135"
         valign="middle"
         align="center"
         style="width: 135px; padding-right: 20px;"
       >
         <img
           src="${LOGO_URL}"
           alt="${LOGO_ALT}"
           width="90"
           style="
             display: block;
             width: 90px;
             max-width: 90px;
             height: auto;
             border: 0;
             outline: none;
             text-decoration: none;
           "
         />
       </td>`;

  const divider = `<td
         width="1"
         style="
           width: 1px;
           background-color: #dce3e8;
           font-size: 0;
           line-height: 0;
         "
       >
         &nbsp;
       </td>`;

  return `
          <!-- ==================== FOOTER CARD ==================== -->
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            border="0"
            width="600"
            style="
              width: 100%;
              max-width: 600px;
              background-color: #ffffff;
              border-top: 3px solid #00629b;
            "
          >

            <!-- ==================== IDENTITY + EXECUTIVE COMMITTEE ==================== -->
            <tr>
              <td style="padding: 25px 25px 20px 25px;">

                <table
                  role="presentation"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  width="100%"
                >
                  <tr>

                    <!-- ==================== LOGO ==================== -->
                    ${logoCell}


                    <!-- ==================== VERTICAL DIVIDER ==================== -->
                    ${divider}


                    <!-- ==================== BRANCH + XCOM ==================== -->
                    <td
                      valign="middle"
                      style="
                        padding-left: 22px;
                      "
                    >

                      <!-- Branch Name -->
                      <div
                        style="
                          color: #1f2933;
                          font-size: 15px;
                          line-height: 21px;
                          font-weight: 700;
                        "
                      >
                        IEEE El Shorouk Academy Student Branch
                      </div>


                      <!-- Season -->
                      <div
                        style="
                          margin-top: 3px;
                          margin-bottom: 12px;
                          color: #00629b;
                          font-size: 10px;
                          line-height: 15px;
                          font-weight: 700;
                          letter-spacing: 1px;
                        "
                      >
                        SEASON 11
                      </div>


                      <!-- ==================== EXECUTIVE COMMITTEE ==================== -->
                      <table
                        role="presentation"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                      >

                        <!-- Chairperson -->
                        <tr>
                          <td
                            style="
                              padding: 3px 0;
                              color: #667482;
                              font-size: 11px;
                              line-height: 17px;
                              white-space: nowrap;
                            "
                          >
                            Chairperson
                          </td>

                          <td
                            style="
                              padding: 3px 0 3px 35px;
                              color: #1f2933;
                              font-size: 11px;
                              line-height: 17px;
                              font-weight: 700;
                              white-space: nowrap;
                            "
                          >
                            Ziad Elsayed
                          </td>
                        </tr>


                        <!-- Vice-Chairperson -->
                        <tr>
                          <td
                            style="
                              padding: 3px 0;
                              color: #667482;
                              font-size: 11px;
                              line-height: 17px;
                              white-space: nowrap;
                            "
                          >
                            Vice-Chairperson
                          </td>

                          <td
                            style="
                              padding: 3px 0 3px 35px;
                              color: #1f2933;
                              font-size: 11px;
                              line-height: 17px;
                              font-weight: 700;
                              white-space: nowrap;
                            "
                          >
                            Lojine Wael
                          </td>
                        </tr>


                        <!-- Treasurer -->
                        <tr>
                          <td
                            style="
                              padding: 3px 0;
                              color: #667482;
                              font-size: 11px;
                              line-height: 17px;
                              white-space: nowrap;
                            "
                          >
                            Treasurer
                          </td>

                          <td
                            style="
                              padding: 3px 0 3px 35px;
                              color: #1f2933;
                              font-size: 11px;
                              line-height: 17px;
                              font-weight: 700;
                              white-space: nowrap;
                            "
                          >
                            Ahmed Hossam
                          </td>
                        </tr>


                        <!-- Secretary -->
                        <tr>
                          <td
                            style="
                              padding: 3px 0;
                              color: #667482;
                              font-size: 11px;
                              line-height: 17px;
                              white-space: nowrap;
                            "
                          >
                            Secretary
                          </td>

                          <td
                            style="
                              padding: 3px 0 3px 35px;
                              color: #1f2933;
                              font-size: 11px;
                              line-height: 17px;
                              font-weight: 700;
                              white-space: nowrap;
                            "
                          >
                            Habiba Khaled
                          </td>
                        </tr>


                        <!-- Webmaster -->
                        <tr>
                          <td
                            style="
                              padding: 3px 0;
                              color: #667482;
                              font-size: 11px;
                              line-height: 17px;
                              white-space: nowrap;
                            "
                          >
                            Webmaster
                          </td>

                          <td
                            style="
                              padding: 3px 0 3px 35px;
                              color: #1f2933;
                              font-size: 11px;
                              line-height: 17px;
                              font-weight: 700;
                              white-space: nowrap;
                            "
                          >
                            Hossm Ghallab
                          </td>
                        </tr>

                      </table>

                    </td>

                  </tr>
                </table>

              </td>
            </tr>


            <!-- ==================== HORIZONTAL DIVIDER ==================== -->
            <tr>
              <td style="padding: 0 25px;">

                <table
                  role="presentation"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  width="100%"
                >
                  <tr>
                    <td
                      style="
                        height: 1px;
                        background-color: #e6eaee;
                        font-size: 0;
                        line-height: 0;
                      "
                    >
                      &nbsp;
                    </td>
                  </tr>
                </table>

              </td>
            </tr>


            <!-- ==================== CONTACT INFORMATION ==================== -->
            <tr>
              <td style="padding: 15px 25px 12px 25px;">

                <table
                  role="presentation"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  width="100%"
                >

                  <!-- HR + Branch Email -->
                  <tr>
                    <td
                      style="
                        padding: 3px 0;
                        color: #667482;
                        font-size: 11px;
                        line-height: 18px;
                      "
                    >

                      <strong style="color: #344454;">
                        HR:
                      </strong>

                      <a
                        href="mailto:ieee.sha.hr@gmail.com"
                        style="
                          color: #00629b;
                          text-decoration: none;
                        "
                      >
                        ieee.sha.hr@gmail.com
                      </a>

                      <span style="color: #c5ccd3;">
                        &nbsp;&nbsp;•&nbsp;&nbsp;
                      </span>

                      <strong style="color: #344454;">
                        Branch:
                      </strong>

                      <a
                        href="mailto:ieee.sha.10@gmail.com"
                        style="
                          color: #00629b;
                          text-decoration: none;
                        "
                      >
                        ieee.sha@gmail.com
                      </a>

                    </td>
                  </tr>


                  <!-- Location -->
                  <tr>
                    <td
                      style="
                        padding: 3px 0;
                        color: #667482;
                        font-size: 11px;
                        line-height: 18px;
                      "
                    >
                      El-Shorouk City, Palms District,
                      Cairo, Egypt 11837
                    </td>
                  </tr>

                </table>

              </td>
            </tr>


            <!-- ==================== SOCIAL MEDIA ==================== -->
            <tr>
              <td
                align="center"
                style="
                  padding: 12px 20px 18px 20px;
                "
              >

                <!-- Facebook -->
                <a
                  href="https://www.facebook.com/IEEE.ElShoroukAcademy.SB/"
                  target="_blank"
                  style="
                    color: #00629b;
                    text-decoration: none;
                    font-size: 11px;
                    line-height: 16px;
                    font-weight: 700;
                  "
                >
                  Facebook
                </a>


                <span
                  style="
                    color: #c5ccd3;
                    padding: 0 8px;
                  "
                >
                  •
                </span>


                <!-- LinkedIn -->
                <a
                  href="https://www.linkedin.com/company/ieee-el-shorouk-academy-student-branch"
                  target="_blank"
                  style="
                    color: #00629b;
                    text-decoration: none;
                    font-size: 11px;
                    line-height: 16px;
                    font-weight: 700;
                  "
                >
                  LinkedIn
                </a>


                <span
                  style="
                    color: #c5ccd3;
                    padding: 0 8px;
                  "
                >
                  •
                </span>


                <!-- Instagram -->
                <a
                  href="https://www.instagram.com/ieee.sha.sb/"
                  target="_blank"
                  style="
                    color: #00629b;
                    text-decoration: none;
                    font-size: 11px;
                    line-height: 16px;
                    font-weight: 700;
                  "
                >
                  Instagram
                </a>

              </td>
            </tr>


          </table>
  `;
};

// ------------------------------------------------------------------
// Shared document shell
// ------------------------------------------------------------------

// Palette shared by every card so the content and the footer read as one design.
const PAGE_BG = '#f7f9fb';
const BRAND = '#00629b';
const INK = '#1f2933';
const MUTED = '#667482';

const CARD_OPEN = `<table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            border="0"
            width="600"
            style="
              width: 100%;
              max-width: 600px;
              background-color: #ffffff;
              border-top: 3px solid ${BRAND};
            "
          >`;

const CARD_CLOSE = `</table>`;

// The blue brand bar that tops every card. Injected by the shell so all emails
// share one copy and cannot drift apart.
const getBrandBar = () => `
            <!-- ==================== BRAND BAR ==================== -->
            <tr>
              <td
                align="center"
                style="
                  padding: 20px 25px;
                  background-color: ${BRAND};
                "
              >
                <div
                  style="
                    color: #ffffff;
                    font-size: 15px;
                    line-height: 21px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                  "
                >
                  IEEE El Shorouk Academy
                </div>
                <div
                  style="
                    margin-top: 3px;
                    color: #bfe0f5;
                    font-size: 10px;
                    line-height: 15px;
                    font-weight: 700;
                    letter-spacing: 2px;
                  "
                >
                  STUDENT BRANCH
                </div>
              </td>
            </tr>`;

// True when the content's own outer table is already a finished brand card.
// Checking the FIRST table only: a bulk body that merely contains some nested
// 600px panel must still be wrapped, otherwise its content would render
// unframed while the footer renders framed.
const isAuthoredCard = (inner) => {
  const openingTag = inner.match(/<table[\s\S]*?>/i);
  if (!openingTag) return false;
  return /max-width:\s*600px/i.test(openingTag[0]) && /border-top:\s*3px solid/i.test(openingTag[0]);
};

/**
 * Normalise arbitrary content into a 600px card that matches the footer.
 *
 * Three shapes are accepted:
 *   1. bare `<tr>` rows                           -> wrapped, brand bar added
 *   2. a finished brand card as the outer table  -> used untouched
 *   3. any other fragment (e.g. a bulk-mail body) -> wrapped, brand bar added
 */
const toCard = (html, { brandBar = true } = {}) => {
  const inner = stripDocumentTags(html);
  if (!inner) return '';

  const bar = brandBar ? getBrandBar() : '';

  // Bare rows go straight into the card so they stay direct children of it.
  if (/^\s*<tr[\s>]/i.test(inner)) {
    return `${CARD_OPEN}${bar}\n            ${inner}\n          ${CARD_CLOSE}`;
  }

  // Already a finished brand card — respect it as authored.
  if (isAuthoredCard(inner)) return inner;

  return `${CARD_OPEN}${bar}
            <tr>
              <td style="padding: 10px;">
                ${inner}
              </td>
            </tr>
          ${CARD_CLOSE}`;
};

// Templates used to be complete documents, which meant the footer had to be
// concatenated after their closing </html>. Strip any document-level tags so a
// template can be dropped in without producing invalid nesting.
const stripDocumentTags = (html = '') =>
  String(html)
    .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
    .replace(/<\/?(?:html|head|body)[^>]*>/gi, '')
    .trim();

/**
 * Assemble a complete email: one page background, the content card, a gutter,
 * then the footer card.
 *
 * @param {string} content   card markup, or a bare fragment which gets wrapped
 * @param {object} [opts]
 * @param {string} [opts.title]      <title> / preheader fallback
 * @param {string} [opts.preheader]  hidden inbox preview text
 * @param {boolean} [opts.footer=true] set false to omit the footer
 */
const buildEmailDocument = ({ content = '', title = '', preheader = '', footer = true, brandBar = true } = {}) => {
  const card = toCard(content, { brandBar });

  const preheaderBlock = preheader
    ? `<div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent; mso-hide: all;">${preheader}</div>`
    : '';

  const spacer = `
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width: 100%; max-width: 600px;">
              <tr>
                <td style="height: 20px; line-height: 20px; font-size: 0;">&nbsp;</td>
              </tr>
            </table>`;

  const footerBlock = footer ? `${spacer}\n            ${getFooterCard()}` : '';

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="color-scheme" content="light" />
    <title>${title || 'IEEE El Shorouk Academy Student Branch'}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: ${PAGE_BG}; font-family: Arial, Helvetica, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
    ${preheaderBlock}
    <table
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      border="0"
      width="100%"
      style="
        width: 100%;
        margin: 0;
        padding: 0;
        background-color: ${PAGE_BG};
        font-family: Arial, Helvetica, sans-serif;
      "
    >
      <tr>
        <td align="center" style="padding: 20px 10px;">
          ${card}${footerBlock}
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

// The footer is composed by buildEmailDocument(); there is deliberately no
// standalone "append a footer to this string" helper any more, because that is
// exactly what used to push markup after the closing </html>.
module.exports = {
  getFooterCard,
  getBrandBar,
  buildEmailDocument,
  toCard,
  stripDocumentTags,
  BRAND,
  INK,
  MUTED,
  PAGE_BG,
};
