/** Implement this interface for a future transactional provider; Email Routing cannot send notifications. */
export interface EnquiryNotifier {
  configured: boolean;
  notify(event: {
    reference: string;
    occasion: string;
    createdAt: number;
  }): Promise<void>;
}
export const noEmailProvider: EnquiryNotifier = {
  configured: false,
  async notify() {},
};
export async function notifyStoredEnquiry(
  db: D1Database,
  event: { reference: string; occasion: string; createdAt: number },
  notifier: EnquiryNotifier,
) {
  if (!notifier.configured) return;
  let status = "sent";
  try {
    await notifier.notify(event);
  } catch {
    status = "failed";
    console.error("enquiry_notification_failed");
  }
  try {
    await db
      .prepare(
        "UPDATE enquiries SET notification_status = ?, updated_at = ? WHERE id = ?",
      )
      .bind(status, Date.now(), event.reference)
      .run();
  } catch {
    console.error("enquiry_notification_status_failed");
  }
}
