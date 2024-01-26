package com.jm.jmsample.approval;

public enum ApprovalState {
	REPORT, // 요청
	CONTINUOUS, // 진행중
	REJECT, // 반려
	COMPLETE, // 완료
	REPORT_BACK, // 회수
}
