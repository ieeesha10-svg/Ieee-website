import { useCallback } from "react";
import api from "../../../utils/api";

// Renders a form's submission email on the server so the preview is the real
// message: the same renderer, the same shell, the same placeholder rules. A
// client-side copy would drift from what members actually receive.
//
// Returns { subject, member, guest, unresolved, guestUnresolved }.
//   member/guest          the finished HTML for each case
//   unresolved            placeholders a member would see as raw text
//   guestUnresolved       db-user[...] a guest cannot fill, expected rather
//                         than a mistake
export function useEmailPreview() {
  // useCallback with no deps: `api` is a module singleton, so this stays
  // referentially stable. A new identity on every render would make the
  // caller's effect re-run forever.
  const previewEmail = useCallback(
    async ({ formTitle, formType, fields, subject, messageBody, asGuest = false }) => {
      const res = await api.post("/form/preview-email", {
        formTitle,
        formType,
        fields,
        subject,
        messageBody,
        asGuest,
      });
      return res.data;
    },
    []
  );

  return { previewEmail };
}
