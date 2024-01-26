package com.jm.jmsample.approval;

import java.util.List;

import lombok.Data;

@Data
public class ApprovedDocument {
	private String id;
	private ApprovalState state;
	private String reporterId;
	private List<ApprovalLine> approvalLines;

	public void setApprovalLines(List<ApprovalLine> approvalLines) throws ApprovalLineException {
		if (this.state == ApprovalState.COMPLETE) {
			throw new ApprovalLineException("Already complete");
		}

		if (!this.canReport()) {
			throw new ApprovalLineException("Not available");
		}

		this.approvalLines = approvalLines;
	}

	public boolean isComplete() {
		return this.state == ApprovalState.COMPLETE;
	}

	public boolean isContinuous() {
		return (this.state == ApprovalState.REPORT || this.state == ApprovalState.CONTINUOUS);
	}

	public boolean isReport() {
		return this.state == ApprovalState.REPORT;
	}

	public boolean canReport() {
		return (this.state == null || this.state == ApprovalState.REJECT || this.state == ApprovalState.REPORT_BACK);
	}

	public ApprovalLine getCurrentApprovalLine() {
		if (this.isComplete()) {
			return null;
		}

		if (this.state != ApprovalState.REPORT && this.state != ApprovalState.CONTINUOUS) {
			return null;
		}

		return this.approvalLines.stream().filter(line -> {
			return line.getState() == ApprovalLineState.WAIT_SIGN;
		}).findFirst().orElse(null);
	}
}
