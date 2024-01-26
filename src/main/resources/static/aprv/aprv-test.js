(function() {
	let aprv = new Approval();

	window.addEventListener('load', () => {
		document.querySelector('#btnTest').addEventListener('click', () => {
			test();
		});

		document.querySelector('#btnTest2').addEventListener('click', () => {
			test2();
		});

		document.querySelector('#btnTest3').addEventListener('click', () => {
			test3();
		});
	});

	async function testSetReport() {
		aprv._setLoginUserId("jm");
		aprv.clear();
		aprv.setReporterId("jm");
		aprv.setAprvLines([
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
		]);

		writeLog("상신");
		await aprv.report();
		currentStateLogs();
	}

	async function test() {
		await testSetReport();

		try {
			writeLog("admin 로그인");
			aprv._setLoginUserId("admin");
			await aprv.sign();
			writeLog("결재 시도");
			currentStateLogs();

			writeLog("admin2 로그인 admin3의 대리인으로 설정");
			aprv._setLoginUserId("admin2");
			aprv._setDelegatedIds(["admin3"]);

			writeLog("결재 시도");
			await aprv.sign();
			currentStateLogs();

			writeLog("결재 시도");
			await aprv.sign();
			currentStateLogs();
		} catch (e) {
			errorLogs(e);
		}
	}

	async function test2() {
		await testSetReport();

		try {
			writeLog("admin 로그인");
			aprv._setLoginUserId("admin");
			writeLog("반려 시도");
			await aprv.reject();
			currentStateLogs();

			writeLog("admin2 로그인");
			aprv._setLoginUserId("admin2");
			writeLog("결재 시도");
			await aprv.sign();
			currentStateLogs();
		} catch (e) {
			errorLogs(e);
		}
	}

	async function test3() {
		await testSetReport();

		try {
			writeLog("회수");
			await aprv.reportBack();
			currentStateLogs();

			writeLog("재상신");
			await aprv.report();
			currentStateLogs();

			writeLog("회수");
			await aprv.reportBack();
			currentStateLogs();

			writeLog("재상신");
			await aprv.report();
			currentStateLogs();
		} catch (e) {
			errorLogs(e);
		}
	}

	function errorLogs(e) {
		writeLog("############################################################");
		writeLog("error");
		writeLog("############################################################");
		writeLog(e);

		currentStateLogs();
		writeLog("############################################################");
	}

	function currentStateLogs() {
		writeLog(
			"==============================================================="
		);
		writeLog("state:", aprv._state);
		writeLog("aprvLines:", aprv._aprvLines);
		writeLog("currentAprvLine:", aprv.currentAprvLine());
		writeLog(
			"---------------------------------------------------------------"
		);
	}
})();