const inputScreenView = document.getElementById("input-screen");
const resultScreenView = document.getElementById("result-screen");
const btn = document.querySelectorAll('.btn');
let inputValue = "";
let result;

const currentDay = new Date().toISOString().split('T')[0];
let historyData = getHistoryFromLocalStorage();

// feature 2 : calc history - save and get history from localStorage for show to view
function historyLog() {
  let historyData = getHistoryFromLocalStorage(); 
  const historyListing = document.getElementById("history_listing");

  // Xóa nội dung cũ
  historyListing.innerHTML = '';

  for (const date of Object.keys(historyData).reverse()) {
    if (historyData.hasOwnProperty(date)) {
      const dateLabel = date === currentDay ? 'Today' : new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });

      let html = `<li class="history_time-marker">
                    ${dateLabel}
                    <ul class="history_daily-listing">`;

      historyData[date].reverse().forEach(entry => {
        html += `<li class="history_calculator-items">
                    <span class="history_operation-item">${entry.operator}</span>
                    <span class="history_result-item">${entry.result}</span>
                  </li>`;
      });

      html += `</ul>
              </li>`;

      historyListing.innerHTML += html;
    }
  }
}
historyLog()
// feature 2.1 : calc save history to localStorage
function saveHistoryToLocalStorage(historyData) {
  localStorage.setItem('historyData', JSON.stringify(historyData));
}
// feature 2.2 : calc get history to localStorage
function getHistoryFromLocalStorage() {
  const historyData = localStorage.getItem('historyData');
  return historyData ? JSON.parse(historyData) : {};
}
// feature 2.3 : calc deleteAll history to localStorage
function deleteAllHistory(){
  localStorage.removeItem('historyData');
  historyData = {};
  saveHistoryToLocalStorage(historyData);
  historyLog();
}

// feature 1.1 : make input check

function insertMultiplicationOperator(inputValue) {
  const regexMultiplication = /(\d|\))\(/g;
  return inputValue.replace(regexMultiplication, '$1*(');
}
function insertMultiplicationOperatorWithClosingBracket(inputValue) {
  const regexMultiplication = /\)(\d)/g;
  return inputValue.replace(regexMultiplication, ')*$1');
}
function insertPercentageOperator(inputValue) {
  const regexPercentage = /(\d+)%/;
  return inputValue.replace(regexPercentage, '$1 / 100');
}

function checkUnclosedParenthesis(inputValue) {
  const regex = /\([^)]*$/;
  return regex.test(inputValue);
}

function checkUnclosedParenthesis(inputValue) {
  let openCount = 0;

  for (let i = 0; i < inputValue.length; i++) {
    if (inputValue[i] === "(") {
      openCount++;
    } else if (inputValue[i] === ")") {
      openCount--;
    }
  }

  return openCount > 0;
}



// feature 1.2 : update calc result when typing 
function updateScreens() {
  resultScreenView.innerHTML = result;
  inputScreenView.value = inputValue;
}

// feature 1.2.1 check input string is math 
// function checkIsValidCalculation(inputValue) {
//   const regexDivisionByZero = /\s*\/\s*0(\s*[+\-*]\s*0\s*)*$/;
//   const mathExpressionRegex = /^[\d+\-*/\s()]+$/;
//   return mathExpressionRegex.test(inputValue) && !regexDivisionByZero.test(inputValue);
// }
function checkIsValidCalculation(inputValue) {
  const regexDivisionByZero = /\s*\/\s*0(\s*[+\-*]\s*0\s*)*$/;
  const mathExpressionRegex = /^(\d+(\.\d+)?\s*[-+*/]\s*)*\d+(\.\d+)?$/;
  return mathExpressionRegex.test(inputValue) && !regexDivisionByZero.test(inputValue);
}
// feature 1.3 : push data from history 
function pushToCalc(e){
  try {
    if(checkIsValidCalculation(e.target.innerText)){
      console.log(inputValue)
      if(inputValue == '') {
        inputValue = e.target.innerText;
      } else {
        inputValue += `+(${e.target.innerText})`
      }  
    } else {
      console.error('input of history err')
      return inputValue;
    }
  } catch (err) {
    console.log('input of history err')
  }
  evaluateExpression();
  updateScreens();
}

// feature 1 : this func calculation
function evaluateExpression() {
  try {
    if (inputValue != '') {
      inputValue = insertMultiplicationOperator(inputValue);
      inputValue = insertMultiplicationOperatorWithClosingBracket(inputValue);
      inputValue = insertPercentageOperator(inputValue);
      result = eval(inputValue);
      if (!Number.isInteger(result)) {
        result = result.toFixed(3).replace(/\.?0+$/, '');
      }
    } else {
      console.error('input value wrong')
      // result = 0;
    }
  } catch (error) {
    console.error(error);
    // console.clear();
  }
}
// feature 1 : this func check key input 
function checkKeyInput(event) {
  // typing input with keyboard or btn click
  const availableKey = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '+', '-', '*', '/', '%', '(', ')'];
  let keyInput = event.key || event.target.getAttribute('data-action');

  switch (keyInput) {
    case "Backspace":
      inputValue = inputValue.slice(0, -1);
      break;

    case "parenthesis":
      const hasOpeningBracket = inputValue.includes("(");
      const endsWithOperator = /[+\-*/]$/.test(inputValue);

      if(endsWithOperator) {
        inputValue += '(';
      } else if (!hasOpeningBracket){
        inputValue += '(';
      } else if (!checkUnclosedParenthesis(inputValue)) {
        inputValue += '(';
      } else {
        inputValue += ')';
      }
      break;
    case "allClear":
      console.log(result); // In giá trị hiện tại của biến result vào console để kiểm tra
      inputValue = '';
      result = 0;
      resultScreenView.innerText = result;
      inputScreenView.value = '';
      break;
    case "Enter":
    case "equal":
      if(checkIsValidCalculation(inputValue)){
        let entry = {
          time: new Date(),
          operator: inputValue,
          result: result
        };

        if (historyData.hasOwnProperty(currentDay)) {
          historyData[currentDay].push(entry);
        } else {
          historyData[currentDay] = [entry];
        }

        inputValue = result;
        inputScreenView.value = result;

        saveHistoryToLocalStorage(historyData);
        historyLog();
      }
      break;
    default:
      if (availableKey.includes(keyInput)) {
        inputValue += keyInput;
      } else {
        event.preventDefault();
      }
      break;
  }

  evaluateExpression();
  updateScreens();
}

// Gọi hàm historyLog() để hiển thị dữ liệu lịch sử từ localStorage
document.addEventListener('keydown', checkKeyInput);
btn.forEach(function (button) {
  button.addEventListener('click', checkKeyInput);
});
const historyListing = document.getElementById('history_listing');
historyListing.addEventListener('click', pushToCalc)

const deleteAllBnt = document.getElementById('delete-all-btn');
deleteAllBnt.addEventListener('click', deleteAllHistory)

historyLog();