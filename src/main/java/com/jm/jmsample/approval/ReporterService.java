package com.jm.jmsample.approval;

public class ReporterService {

	private String getLoginUserId() {
		return "";
	}

	public ApprovedDocument report(ApprovedDocument doc) throws ApprovalException {

		if (doc.isComplete()) {
			throw new ApprovalException("Already complete");
		}

		if (!doc.canReport()) {
			throw new ApprovalException("Can not report");
		}

		if (!doc.getReporterId().equals(this.getLoginUserId())) { // login user
			throw new ApprovalException("Not an reporter");
		}

		if (doc.getApprovalLines().size() == 0) {
			throw new ApprovalException("Approval Lines is empty");
		}

		doc.setState(ApprovalState.REPORT);
		return doc;
	}

	public ApprovedDocument reportBack(ApprovedDocument doc) throws ApprovalException {

		if (doc.isComplete()) {
			throw new ApprovalException("Already complete");
		}

		// ��� ���°� �ƴϸ� �Ұ�
		if (!doc.isReport()) {
			throw new ApprovalException("Not available");
		}

		if (!doc.getReporterId().equals(this.getLoginUserId())) { // login user
			throw new ApprovalException("Not an reporter");
		}

		doc.setState(ApprovalState.REPORT_BACK);
		return doc;
	}
}
