//initializing empty array which stores the expenses
let expenses = JSON.parse(localStorage.getItem("expenses"))||[];

//DOM references
const form = document.getElementById("expense-form");
const amountInput = document.getElementById("amount");
const categorySelector = document.getElementById("categorySelector");
const dateInput = document.getElementById("date");
const noteInput = document.getElementById("note");
const tableBody = document.getElementById("table-body");
const totalAmount = document.getElementById("total-amount");
const addExpense = document.getElementById('Submit-expense')
const periodSelector = document.getElementById("period"); //dropdown for daily/weekly/monthly/yearly/all filter

/**
 * 
 * It builds one row which contains the expense form data
 * @param {object} expenses 
 * @returns an html elemt of row
 */
function buildExpenseRow(expenses){
    const row = document.createElement("tr")
    row.innerHTML = `
    <td>${expenses.category}</td>
    <td>${expenses.note}</td>
    <td>${expenses.date}</td>
    <td>${expenses.amount}</td>
    <td><button class="delete-btn" data-id="${expenses.id}">Delete</button></td>
    `
    return row
}

/**
 * Checks whether a given expense date string (yyyy-mm-dd) falls inside
 * the currently selected period, relative to today
 * @param {string} dateStr 
 * @param {string} period 
 * @returns {boolean}
 */
function isInPeriod(dateStr, period){
    if(period === "all") return true

    const expenseDate = new Date(dateStr)
    const today = new Date()
    //zeroing out time so we're only comparing calendar dates, not time-of-day
    today.setHours(0,0,0,0)
    expenseDate.setHours(0,0,0,0)

    if(period === "daily"){
        return expenseDate.getTime() === today.getTime()
    }

    if(period === "weekly"){
        //start of week = today minus however many days since Sunday
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        return expenseDate >= startOfWeek && expenseDate <= endOfWeek
    }

    if(period === "monthly"){
        return expenseDate.getMonth() === today.getMonth() &&
               expenseDate.getFullYear() === today.getFullYear()
    }

    if(period === "yearly"){
        return expenseDate.getFullYear() === today.getFullYear()
    }

    return true
}

// Handles the table body of the expense tracker
function render(){
    //creates an empty row
    tableBody.innerHTML = "";

    //filters the full expense list down to whatever period is currently selected
    const filteredExpenses = expenses.filter(expense => isInPeriod(expense.date, periodSelector.value))

    //checks if the filtered list is empty, if it is then it shows a text
    if(filteredExpenses.length === 0){
        const row = document.createElement("tr")
        row.innerHTML = `<td>No expenses added - add one expense above</td>`
        tableBody.appendChild(row)
    }else{ //if there are expenses matching the period then it appends onto those rows
        filteredExpenses.forEach((expenses)=>{
            tableBody.appendChild(buildExpenseRow(expenses))
        })
    }

    //This adds the entire amount of the filtered rows and reduces it to sum
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    totalAmount.textContent = `₹${total.toFixed(2)}`
} 

//This is an event listerner which works on the action of the submit button and as soon as clicked on the submit button then the expense data is displayed in table body because we are calling render
form.addEventListener('submit', (event)=>{
    event.preventDefault() //this prevents the browser's default reload

    //converting amount data type
    const amount = parseFloat(amountInput.value)

    //checking if the value of the amount is not a number or less than 0
    if(Number.isNaN(amount) || amount <=0){
        alert("Please enter an amount greater than 0")
        return
    }

    //Building new expense object each time with a unique id
    const newExpense = {
        id: "e" + Date.now(), //to make every add expense unique
        category: categorySelector.value, //calling the value of the category
        note: noteInput.value.trim(), // triming the note to only written text/charachters
        date:dateInput.value || new Date().toISOString().slice(0,10), //slicing the date from entire string to just the date
        amount, //since amount is already parsed into a floating point number so we take it directly
        //2026-07-05T17:14:000Z
    }
    expenses.push(newExpense) //Adds the object to the end of the expense array in the memory as well as the table body
    localStorage.setItem("expenses",JSON.stringify(expenses))
    render() //Re render entire table after each and every expense is added, so the new row appears on the screen immediately
    form.reset() //form goes back to original state with empty/placeholder values
    dateInput.value = new Date().toISOString().slice(0,10) //Date is set to the current date 
})

//event listener for delete button, attached once so it works even before any expense is submitted (e.g. right after a refresh)
tableBody.addEventListener('click', (event) => {
    if(event.target.classList.contains('delete-btn')){
        const id = event.target.dataset.id
        expenses = expenses.filter(expense => expense.id !== id)
        localStorage.setItem("expenses",JSON.stringify(expenses)) //saving updated list after delete so it persists on refresh
        render()
    }
})

//re-render whenever the user changes the filter period, so the table/total update to match
periodSelector.addEventListener('change', render)

//initial page load
dateInput.value = new Date().toISOString().slice(0,10)
render()