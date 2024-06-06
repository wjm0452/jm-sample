class TextTokenizer {

	constructor(text, customToken) {
		this._text = text;
		this._buff = text.split('');
		this._pos = -1;
		this._customToken = {};

		if (customToken) {
			this._customToken = customToken;
		}
	}

	isKor(c) {
		return c >= 'ㄱ' && c <= '힣';
	}

	isAlphaNumeric(c) {

		if ((c >= '0' && c <= '9') || (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') ||
			c == '_'
		) {
			return true;
		}

		return this.isKor(c);
	}

	remaning() {
		return !(this._pos == this._buff.length - 1);
	}

	position(pos) {

		if (arguments.length == 0) {
			return this._pos;
		}

		this._pos += pos;
	}

	get(pos) {

		if (arguments.length == 0) {
			return this._buff[++this._pos];
		}

		return this._buff[this._pos + pos];
	}

	getString(pos, offset) {

		if (arguments.length == 1) {
			offset = pos;
			pos = 0;
		}

		pos += this._pos;
		return this._text.substring(pos, Math.min(pos + offset, this._buff.length));
	}

	hasNext() {
		return this.remaning();
	}

	next() {

		for (var key in this._customToken) {

			let begin = key,
				end = this._customToken[key];

			let c = this.get(1);

			if (begin == this.getString(1, begin.length)) {

				let append = '';
				append += begin;
				this.position(begin.length);

				while (this.remaning()) {

					c = this.get();

					if (end.charAt(0) == c) {
						if (end == this.getString(end.length)) {
							break;
						}
					}

					append += c;
				}

				append += end;
				this.position(end.length - 1);
				return append;
			}

		}

		let append = '';

		do {

			let c = this.get();

			append += c;

			if (!this.isAlphaNumeric(c)) {
				break;
			}

			if (!this.remaning()) {
				break;
			}

		} while (this.isAlphaNumeric(this.get(1)));

		return append;
	}

}