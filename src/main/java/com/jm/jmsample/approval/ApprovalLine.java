package com.jm.jmsample.approval;


import lombok.Data;

@Data
public class ApprovalLine {
	private ApprovalLineState state;
	private String userId;
}
