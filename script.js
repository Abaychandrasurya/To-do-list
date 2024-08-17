import Airtable from "airtable";

var base = new Airtable({
  apiKey: "pat8DfXrExrvvwQdj.c5f355f419ce84ce2d63eb5ef48d948bfdc68af2e6ad1ffa124d220d62955f02",
}).base("app1uwISJ4tS2ig7N");

function updateTodo(toDo)  {
  base('ToDos').update([toDo])
}

function deleteTodo(id) {
  base('ToDos').destroy([id], function(err, deletedRecords) {
    if (err) {
      console.error(err);
      return;
    }
    const listItem = document.getElementById(`item-${id}`);
    listItem.remove();
  })
}


function getMyTodos(limit=undefined){
  base("ToDos")
    .select({
      fields: ["ToDo", "Completed", "CreatedAt"],
      view: "Grid view",
      ...(limit !== undefined ? {maxRecords: limit} : {}), 
      sort: [{field: "CreatedAt", direction: limit !== undefined ? "desc" : "asc"}]
    })
    .eachPage(
      function page(records, fetchNextPage) {
        const myTaskList = document.getElementById("my-task-list");
  
        console.log(records);
        if(records.length === 0){
          myTaskList.innerHTML = "<p class='text-primary'>No to do found</p>";
        } 
  
        records.forEach(function (record) {
          const listItem = document.createElement("li");
          listItem.classList.add("list-group-item");
          listItem.id = `item-${record.id}`;
  
          const inputElement = document.createElement("input");
          inputElement.classList.add("form-check-input");
          inputElement.classList.add("me-1");
          inputElement.name = `${record.id}`;
          inputElement.type = "checkbox";
          inputElement.checked = record.fields.Completed === 0 ? "" : "checked";
          inputElement.id = `${record.id}`;

          inputElement.addEventListener("change", (e) => {
            updateTodo({
              id: e.target.id,
              fields: {
                Completed: e.target.checked ? 1 : 0
              }
            })
          })
  
          const labelElement = document.createElement("label");
          labelElement.classList.add("form-check-label");
          labelElement.htmlFor = `${record.id}`;
          labelElement.innerText = `${record.fields.ToDo} - (${(new Date(record.fields.CreatedAt))?.toLocaleDateString()} at ${(new Date(record.fields.CreatedAt))?.toLocaleTimeString()})`;

          const deleteButton = document.createElement("button");
          deleteButton.classList.add("btn");
          deleteButton.classList.add("btn-danger");
          deleteButton.classList.add("btn-xs");
          deleteButton.classList.add("mx-2");
          deleteButton.innerText = "Delete";

          deleteButton.addEventListener("click", (e) => {
            deleteTodo(record.id);
            console.log("To do deleted")
          })
  
          listItem.append(inputElement);
          listItem.append(labelElement);
          listItem.append(deleteButton);
  
          myTaskList.append(listItem);
        });
  
      },
      function done(err) {
        if (err) {
          console.error(err);
          return;
        }
      }
    );
}

getMyTodos()



const todoForm = document.getElementById("todoForm");

todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const todoInput = e.target.todo.value;

  let isToDoValid = false;

  if (todoInput !== "" && todoInput?.length > 8 && todoInput?.length < 60) {
    isToDoValid = true;
  }

  if (isToDoValid) {
    fetch(
    `https://connect.pabbly.com/workflow/sendwebhookdata/IjU3NjUwNTY0MDYzMTA0MzY1MjZmNTUzMTUxMzYi_pc`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ToDo: todoInput,
          Completed: false,
        }),
      }
    )
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        if (response.status === "success") {
          todoForm.reset();
          setTimeout(() => {
            getMyTodos(1)
          }, 4000);
        }
      })
      .catch((error) => {
        console.log(error);
        alert(error);
      });
  }
});