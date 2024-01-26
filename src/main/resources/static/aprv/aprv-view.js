(function() {

	let aprv = new Approval();
	aprv._setLoginUserId("jm");
	aprv.setReporterId("jm");
	aprv.addUpdateStateHandler(updateStateHandler);

	window.addEventListener('load', () => {

		document.querySelectorAll('.user').forEach((node) => {
			node.addEventListener('click', (e) => {
				let selectedUserId = e.target.dataset.user;

				writeLog('login', selectedUserId)
				aprv._setLoginUserId(selectedUserId);
				aprv.setId();
			});
		});

		document.querySelector('#btnSetLines').addEventListener('click', () => {

			let lines = [
				{
					no: 1,
					userId: "admin",
					state: LINE_STATE.WAIT_SIGN,
				},
				{
					no: 2,
					userId: "admin2",
					state: LINE_STATE.WAIT_SIGN,
				},
				{
					no: 3,
					userId: "admin3",
					state: LINE_STATE.WAIT_SIGN,
				},
			];

			aprv.setAprvLines(lines);
			writeLog(lines);
		});

		document.querySelector('#btnReport').addEventListener('click', () => {
			try {
				aprv.report();
			} catch (e) {
				writeLog(e);
			}
		});

		document.querySelector('#btnReportBack').addEventListener('click', () => {
			try {
				aprv.reportBack();
			} catch (e) {
				writeLog(e);
			}
		});

		document.querySelector('#btnSign').addEventListener('click', () => {
			try {
				aprv.sign();
			} catch (e) {
				writeLog(e);
			}
		});

		document.querySelector('#btnReject').addEventListener('click', () => {
			try {
				aprv.reject();
			} catch (e) {
				writeLog(e);
			}
		});
	});

	function updateStateHandler(e) {
		let state = e.state,
			aprvLines = e.aprvLines;

		writeLog(e);

		if (!state) {
			document.querySelector('#aprvView').innerHTML = '';
			document.querySelector('#btnSetLines').disabled = false;
			document.querySelector('#btnReport').disabled = false;
			document.querySelector('#btnReportBack').disabled = false;
			document.querySelector('#btnSign').disabled = false;
			document.querySelector('#btnReject').disabled = false;
			return;
		}

		let html = aprvLines.map(line => {
			return `
				<div style="display: inline-block;">
				<div style="width: 100px;">
					<div style="height: 50px; border: solid grey 1px; padding: 5px;">${line.userId}</div>
					<div style="border: solid grey 1px; border-top-width: 0px; padding: 5px;">${line.state}</div>
				</div>
				</div>
			`;
		}).join('');

		document.querySelector('#aprvView').innerHTML = html;

		document.querySelector('#btnSetLines').disabled = true;
		document.querySelector('#btnReport').disabled = true;
		document.querySelector('#btnReportBack').disabled = true;
		document.querySelector('#btnSign').disabled = true;
		document.querySelector('#btnReject').disabled = true;

		let loginUserId = aprv._getLoginUserId();

		if (state == APRV_STATE.REPORT) {
			// 상신자 - 회수 활성화
			// 현재 결재자 - 결재, 반려 활성화
			// 기타 - 비활성화
			if (aprv.isReporter()) {
				document.querySelector('#btnReportBack').disabled = false;
			}
			else if (aprv.isCurrentSigner()) {
				document.querySelector('#btnSign').disabled = false;
				document.querySelector('#btnReject').disabled = false;
			}

		} else if (state == APRV_STATE.REPORT_BACK) {
			// 상신자 - 상신 활성화(재상신), 결재선 재선택 활성화
			// 기타 - 비활성화
			if (aprv.isReporter()) {
				document.querySelector('#btnSetLines').disabled = false;
				document.querySelector('#btnReport').disabled = false;
			}
		} else if (state == APRV_STATE.REJECT) {
			// 상신자 - 상신 활성화(재상신), 결재선 재선택 활성화
			// 기타 - 비활성화
			if (aprv.isReporter()) {
				document.querySelector('#btnSetLines').disabled = false;
				document.querySelector('#btnReport').disabled = false;
			}
		} else if (state == APRV_STATE.CONTINUOUS) {
			// 현재 결재자 - 결재, 반려 활성화
			// 기타 - 비활성화
			if (aprv.isCurrentSigner()) {
				document.querySelector('#btnSign').disabled = false;
				document.querySelector('#btnReject').disabled = false;
			}
		} else if (state == APRV_STATE.COMPLETE) {
			// 비활성화
		}
	}

})();

function writeLog() {

	let messages = [];

	for (let i = 0; i < arguments.length; i++) {
		let msg = arguments[i];

		if (typeof msg == 'object') {
			msg = JSON.stringify(msg);
		}

		messages.push(msg);
	}

	console.log(messages.join(' '));
	document.querySelector('#logs').value += messages.join(' ') + '\n';
	
	let scrollTop = document.querySelector('#logs').scrollHeight - document.querySelector('#logs').clientHeight;
	document.querySelector('#logs').scrollTop = scrollTop;
}
