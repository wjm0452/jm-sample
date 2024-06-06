window.addEventListener("load", function () {
  document.querySelector("#btnParse").addEventListener("click", async () => {
    let content = await getContent();

    parse(new window.DOMParser().parseFromString(content, "text/xml"));
  });
});
var test = "";
async function getContent() {
  let data = await fetch(
    "http://127.0.0.1:5500/src/main/resources/static/analyze/sample.xml"
  );
  return data.text();
}

function parse(xml) {
  parseBody(xml.querySelectorAll("body"));
  let scritpNodes = xml.querySelectorAll("script");

  scritpNodes.forEach(function (scritpNode) {
    if (!scritpNode.getAttribute("src")) {
      parseScript(scritpNode.text);
    }
  });
}

function parseBody(body) {}

function parseScript(jsText) {
  const tokenMap = { "//": "\n", "/*": "*/", '"': '"', "'": "'" };
  const tokenizer = new TextTokenizer(jsText, tokenMap);

  let buffer = [];
  while (tokenizer.hasNext()) {
    let token = tokenizer.next();
    token = token.trim();

    if (token == ".") {
      buffer.push(token);
      continue;
    }

    if (token == "{") {
      buffer.push("{");
      writeLog(buffer);
      parseScript(getStatement(tokenizer, "{", "}").join(" "));
      buffer = ["}"];
      continue;
    } else if (token == "[") {
      buffer = buffer.concat(getStatement(tokenizer, "[", "]"));
      continue;
    }

    if (checkToken(token)) {
      buffer.push(token);
    } else {
      buffer.push(token);
      writeLog(buffer);
      buffer = [];
    }
  }

  writeLog(buffer);
}

function getStatement(tokenizer, startToken, endToken) {
  let count = 1;
  let buffer = [];

  while (tokenizer.hasNext()) {
    let token = tokenizer.next();

    if (token == endToken) {
      count--;
      if (count == 0) {
        return buffer;
      }
    }

    if (token == startToken) {
      count++;
    }

    buffer.push(token);
  }
}

function checkToken(token) {
  if (token == "\n" || token == ";") {
    return false;
  }

  return true;
}

const RESERVED_WORD = ["function", "var", "let", "const"];

let number = 0;
function writeLog(array) {
  if (!array.length) {
    return;
  }

  var text = array
    .map((word) => {
      word = word.trim();
      if (RESERVED_WORD.indexOf(word) > -1) {
        return `${word} `;
      }
      if (word == "{") {
        return ` ${word}`;
      }
      if (word == "}") {
        return `${word}`;
      }
      if (word == ";") {
        return `${word}\n`;
      }
      if (word == "=") {
        return ` ${word} `;
      }
      return word;
    })
    .join("");

  text = text.trim();

  if (!text) {
    return;
  }

  const txtLog = document.querySelector("#txtLog");
  number++;
  txtLog.value = txtLog.value + "\r\n" + `[${number}] ${text}`;
}
