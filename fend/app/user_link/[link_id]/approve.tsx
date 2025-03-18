'use client';

import { ApproveDialog } from "@/components/approve-dialog";
import { setApprovalCookie, cancelApproval } from "@/app/actions/server-actions-cookies";

interface ApproveLinkDialogProps {
  linkId: string;
  approvedRedirectUrl: string;
  cancelledRedirectUrl: string;
}

export function ApproveLinkDialog({
  linkId,
  approvedRedirectUrl,
  cancelledRedirectUrl,
}: ApproveLinkDialogProps) {
  const handleApprove = async () => {
    await setApprovalCookie(linkId, approvedRedirectUrl);
  };

  const handleCancel = async () => {
    await cancelApproval(cancelledRedirectUrl);
  };

  return (
    <ApproveDialog
      title="Link Your Accounts"
      description="By approving, your accounts will be connected. Would you like to proceed with this account linking?"
      onCancel={handleCancel}
      onApprove={handleApprove}
    />
  );
}