package com.jm.jmsample.approval;

public class ApprovalService {

	private String getLoginUserId() {
		return "";
	}

	private String[] getDelegatedIds(String userId) {
		return new String[0];
	}

	private boolean isCurrentSigner(ApprovedDocument doc) {
		ApprovalLine line = doc.getCurrentApprovalLine();

		if (line == null) {
			return false;
		}

		String signerId = line.getUserId();

		if (signerId.equals(getLoginUserId())) {
			// login user
			return true;
		}

		String[] delegatedIds = this.getDelegatedIds(signerId); // delegated user

		return delegatedIds.length > 0;
	}

	public ApprovedDocument sign(ApprovedDocument doc) throws ApprovalException {

		if (doc.isComplete()) {
			throw new ApprovalException("Already complete");
		}

		if (!doc.isContinuous()) {
			throw new ApprovalException("Not available");
		}

		if (!isCurrentSigner(doc)) {
			throw new ApprovalException("Not an approver");
		}

		ApprovalLine line = doc.getCurrentApprovalLine();
		line.setState(ApprovalLineState.SIGN);

		if (!doc.getApprovalLines().stream().anyMatch(l -> l.getState() == ApprovalLineState.WAIT_SIGN)) {
			doc.setState(ApprovalState.COMPLETE);
		}

		return doc;
	}

	public ApprovedDocument reject(ApprovedDocument doc) throws ApprovalException {
		if (doc.isComplete()) {
			throw new ApprovalException("Already complete");
		}

		if (!doc.isContinuous()) {
			throw new ApprovalException("Not available");
		}

		if (!isCurrentSigner(doc)) {
			throw new ApprovalException("Not an approver");
		}

		ApprovalLine line = doc.getCurrentApprovalLine();
		line.setState(ApprovalLineState.REJECT);
		doc.setState(ApprovalState.REJECT);

		return doc;
	}
}
