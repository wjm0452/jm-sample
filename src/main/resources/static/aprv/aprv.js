const APRV_STATE = {
	REPORT: "report", // 상신
	CONTINUOUS: "continuous", // 진행중
	REJECT: "reject", // 반려
	COMPLETE: "complete", // 완료
	REPORT_BACK: "reportBack", // 회수
};

const LINE_STATE = {
	WAIT_SIGN: "waitSign", // 미결
	SIGN: "sign", // 결재
	REJECT: "reject", // 반려
};

class Approval {
	_aprvLines = [];
	_state;
	_reporterId;
	_updateStateHandler;

	setId(id) {
		return Promise.resolve().then((item) => {
			// this._updateState(item);
			item = {
				state: this._state,
				aprvLines: this._aprvLines,
			};

			this._updateState(item);
		});
	}

	setReporterId(userId) {
		this._reporterId = userId;
	}

	getReporterId() {
		return this._reporterId;
	}

	setAprvLines(aprvLines) {
		if (this._state == APRV_STATE.COMPLETE) {
			throw "Already complete";
		}

		if (!this.canReport()) {
			throw "Not available";
		}

		this._aprvLines = [...aprvLines];
	}

	addUpdateStateHandler(handler) {
		this._updateStateHandler = handler;
	}

	getState() {
		return this._state;
	}

	clear() {
		this._aprvLines = [];
		this._state = null;
	}

	isComplete() {
		return this._state == APRV_STATE.COMPLETE;
	}

	isContinuous() {
		return (
			this._state == APRV_STATE.REPORT || this._state == APRV_STATE.CONTINUOUS
		);
	}

	isReport() {
		return this._state == APRV_STATE.REPORT;
	}

	canReport() {
		return (
			!this._state ||
			this._state == APRV_STATE.REJECT ||
			this._state == APRV_STATE.REPORT_BACK
		);
	}

	_loginUserId = "";
	_delegatedIds;

	_getDelegatedIds() {
		return this._delegatedIds;
	}

	_setDelegatedIds(userIds) {
		this._delegatedIds = [...userIds];
	}

	_getLoginUserId() {
		return this._loginUserId;
	}

	// test function
	_setLoginUserId(userId) {
		this._loginUserId = userId;
	}

	isReporter() {
		return this.getReporterId() == this._getLoginUserId(); // login user
	}

	isCurrentSigner() {
		let line = this.currentAprvLine();

		if (!line) {
			return false;
		}

		if (line.userId == this._getLoginUserId()) {
			// login user
			return true;
		}

		return this.isDelegateSigner();
	}

	isDelegateSigner() {
		let line = this.currentAprvLine();

		if (!line) {
			return false;
		}

		let delegatedIds = this._getDelegatedIds(); // delegated user
		return delegatedIds && delegatedIds.indexOf(line.userId) > -1;
	}

	currentAprvLine() {
		if (this.isComplete()) {
			return null;
		}

		if (
			this._state != APRV_STATE.REPORT &&
			this._state != APRV_STATE.CONTINUOUS
		) {
			return null;
		}

		return this._aprvLines.find((aprv) => {
			return aprv.state == LINE_STATE.WAIT_SIGN;
		});
	}

	_updateState(item) {
		let state = item.state,
			aprvLines = item.aprvLines;

		this._state = state;
		this._aprvLines = aprvLines;

		if (this._updateStateHandler) {
			this._updateStateHandler({
				state: state,
				aprvLines: aprvLines
			});
		}
	}

	openAprvLinerSettingPopup() {
		if (this.isComplete()) {
			throw "Already complete";
		}

		if (this._state != null && this._state != APRV_STATE.REJECT) {
			throw "Not available";
		}

		// open(_aprvLines);
	}

	/**
	 * 결재 요청
	 *
	 * @returns Promise
	 */
	report() {
		if (this.isComplete()) {
			throw "Already complete";
		}

		if (!this.canReport()) {
			throw "Can not report";
		}

		if (!this.isReporter()) {
			throw "Not an reporter";
		}

		if (this._aprvLines.length == 0) {
			throw "Approval Lines is empty";
		}

		// update _aprvLines
		return Promise.resolve().then(() => {
			let item = {
				state: APRV_STATE.REPORT,
				aprvLines: this._aprvLines,
			};

			this._updateState(item);
		});
	}

	/**
	 * 회수(결재전에만 회수 가능)
	 *
	 * @returns Promise
	 */
	reportBack() {
		if (this.isComplete()) {
			throw "Already complete";
		}

		// 상신 상태가 아니면 불가
		if (!this.isReport()) {
			throw "Not available";
		}

		if (!this.isReporter()) {
			throw "Not an reporter";
		}

		/*
	   서버사이드처리
		- 로그인유저가 상신자가 맞는지 체크하도록 한다.
		- 결재 진행중이라면 회수 할 수 없다.
	   */
		return Promise.resolve().then(() => {
			// CONTINUOUS or COMPLETE;
			let item = {
				state: APRV_STATE.REPORT_BACK,
				aprvLines: this._aprvLines,
			};

			this._updateState(item);
		});
	}

	/**
	 * 결재
	 *
	 * @returns Promise
	 */
	sign() {
		if (this.isComplete()) {
			throw "Already complete";
		}

		if (!this.isContinuous()) {
			throw "Not available";
		}

		if (!this.isCurrentSigner()) {
			throw "Not an approver";
		}

		let line = this.currentAprvLine();
		line.state = LINE_STATE.SIGN;

		// 서버사이드에서 로그인유저가 결재자가 맞는지 체크하도록 한다.
		return Promise.resolve().then(() => {
			// CONTINUOUS or COMPLETE;
			let state = APRV_STATE.CONTINUOUS;
			if (
				this._aprvLines.filter((aprv) => aprv.state == LINE_STATE.WAIT_SIGN)
					.length == 0
			) {
				state = APRV_STATE.COMPLETE;
			}

			let item = {
				state: state,
				aprvLines: this._aprvLines,
			};

			this._updateState(item);
		});
	}

	/**
	 * 반려
	 *
	 * @returns Promise
	 */
	reject() {
		if (this.isComplete()) {
			throw "Already complete";
		}

		if (!this.isContinuous()) {
			throw "Not available";
		}

		if (!this.isCurrentSigner()) {
			throw "Not an approver";
		}

		let line = this.currentAprvLine();
		line.state = LINE_STATE.REJECT;

		// 서버사이드에서 로그인유저가 결재자가 맞는지 체크하도록 한다.
		return Promise.resolve().then(() => {
			// REJECT
			let item = {
				state: APRV_STATE.REJECT,
				aprvLines: this._aprvLines,
			};

			this._updateState(item);
		});
	}
}

