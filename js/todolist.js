/**
 *
 *
 * @author carpincho
 * @since 04/03/19.
 * @version 1.0
 */



(() => {
    'use strict';

    const API_URL = 'https://task-backend-fpuna.herokuapp.com/tasks';
    const TASK_STATUS = {
        PENDING: 'PENDIENTE',
        DONE: 'TERMINADO'
    };

    class Task {
        constructor(description) {
            this.id = null;
            this.description = description;
            this.status = TASK_STATUS.PENDING;
            this.date = new Date().toUTCString();
        }
    }

    /**
     * This method is executed once the page have just been loaded and call the service to retrieve the
     * list of tasks
     */
    document.onreadystatechange = () => {

        // TODO ITEM 0: Llamar al API con el método GET para recuperar la lista de tareas existentes.
        //  - Como parámetro `callbackSuccess` envía la función `loadTasks`.
        //  - Como parámetro `callbackError` envía una función que llame al método `showError` enviando un mensaje de
        //    error
        //  - La llamada debe ser asíncrona.
        let parametros ={}

        Ajax.sendGetRequest(API_URL, parametros,MediaFormat.JSON, (value)=>loadTasks(value), (error)=>showError(error), true);
    };

    /**
     * This method displays an error on the page.
     * @param code the status code of the HTTP response.
     * @param text error message
     */
    const showError = (code, text) => {
        // TODO ITEM 6 recuperar el elemento HTML con la clase `error-bar` y modificar el HTML interno de
        // manera a mostrar el mensaje de error.
        // El mensaje de error debe desaparacer luego de 3 segundos.
    
            document.getElementsByClassName("error-bar").innerHTML = text;
            document.getElementsByClassName("error-bar").innerHTML="";
            
      
    };

    /**
     * This method receives the list of tasks and calls the method to add each of them to the page
     *
     * @param array the string coming on the body of the API response
     */
    const loadTasks = (array) => {

        let tasks = JSON.parse(array);
        for (let i in tasks) {
            if (tasks.hasOwnProperty(i)) {
                addTaskToList(tasks[i]);
            }
        }
    };

    /**
     * Send the request to the API to create a new task
     *
     * @param e the event from the click on the new item button
     * @return {boolean}
     */
    const addTask = (e) => {
        let newTaskInput = document.getElementById("new-task");
        let content = newTaskInput.value;
        if (content.length === 0) return false;

        e.preventDefault();

        let task = new Task(content);

        // TODO ITEM 1: Llamar al API con el método POST para crear una nueva tarea.
        //  - Como parámetro `callbackSuccess` envía una función que llame al método `addTaskToList` enviando la
        //    variable `task` y limpia el valor del input#new-task.
        //  - Como parámetro `callbackError` envía una función que llame al método `showError` enviando un mensaje de
        //    error
        //  - La llamada debe ser asíncrona.
        //  - No te olvides de envíar el parámetro `task` para que se cree la tarea.

        newTaskInput.value = "";
        Ajax.sendPostRequest(API_URL,task,MediaFormat.JSON, (exitoso)=>addTaskToList(exitoso), (error)=>showError(error), true);
        
       

  
    };

    /**
     * This procedure links the new task button the addTask method on the click event.
     */
    let addButtons = document.getElementsByClassName('add');
    for (let i in addButtons)
        addButtons.item(Number(i)).onclick =  (e) => addTask(e);

    /**
     * We associate a function to manipulate the DOM once the checkbox value is changed.
     * Change the task to the completed or incomplete list (according to the status)
     */
    const addOnChangeEvent = (task) => {
        const checkBox = document.getElementById(`task-${task.id}`).querySelector('label > input');
        checkBox.onchange = (e) => {

            // TODO ITEM 3: leer el nuevo estado de la tarea (que solo puede ser TERMINADO(true) or PENDIENTE(false)) accediendo a la
            //  propiedad `e.target.checked`. Con éste nuevo dato, debes mostrar la tarea junto con las tareas de su
            //  mismo estado (e.g. si la tarea estaba pendiente pero el usuario hace click en el checkbox, el estado de
            //  la tarea debe cambiar a terminada y debe ahora mostrarse con las otras tareas terminadas).
            // - Una forma de hacerlo es remover directamente el archivo con el id `task-${task.id}` del DOM HTML
            // y luego llamar a la función `addTaskToList` que re-creara la tarea con el nuevo estado en el lugar correcto.
            // - No te olvides de llamar al API (método PUT) para modificar el estado de la tarea en el servidor.
            console.log(task);
            removeTaskFromList(task.id);
            let aux = task.status;
           if( e.target.checked ){
            task.status = TASK_STATUS.DONE;
           }else{
            task.status = TASK_STATUS.PENDING;
           }



           Ajax.sendPutRequest(API_URL+"/"+id,task, MediaFormat.JSON,
            (callbackSuccess) => {
                                showWarning(200,task.id)
                               },
           (callbackError) => {
                                task.status =aux;
                                showError(callbackError,'No se pudo modificar la tarea.');
                           }, false); 
           addTaskToList(task);

        };
    };

    /**
     * This method modifies the DOM HTML to add new items to the task list.
     * @param task the new task.
     */
    const addTaskToList = (task) => {
        let newItem = document.createElement('li');
        newItem.setAttribute('id', `task-${task.id}`);

        let label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" ${task.status === TASK_STATUS.DONE ? "checked" : ""}/> ${task.description}`;

        let editButton = document.createElement('button');
        editButton.innerText = 'Editar';
        editButton.classList.add('edit');
        editButton.setAttribute('data-id', task.id);
        editButton.onclick = (e) => editTask(e);

        let deleteButton = document.createElement('button');
        deleteButton.innerText = 'Borrar';
        deleteButton.classList.add('delete');
        deleteButton.setAttribute('data-id', task.id);
        deleteButton.onclick = (e) => removeTask(e);

        newItem.appendChild(label);
        newItem.appendChild(editButton);
        newItem.appendChild(deleteButton);

       if (task.status  === TASK_STATUS.PENDING)
            document.getElementById('incomplete-tasks').appendChild(newItem);
        else
            document.getElementById('completed-tasks').appendChild(newItem);

        addOnChangeEvent(task);
    };

    /**
     * This method modifies the DOM HTML to display a form that allow the user to change the
     * task description and send a PUT request to modify it on the server side
     *
     * @param e
     */
    const editTask = (e) => {
        // We retrieve the value of the attribute data-id;
        const id = e.target.dataset.id;

        let currentDOMTask = document.getElementById(`task-${id}`);
        currentDOMTask.querySelector("label > input[type=checkbox]").remove();

        let currentTask = new Task(currentDOMTask.querySelector("label").innerHTML.trim());
        currentTask.id = id;

        currentDOMTask.querySelector('label').remove();

        let inputText = document.createElement('input');
        inputText.setAttribute('id', `task-edit-${currentTask.id}`);
        inputText.setAttribute('type', 'text');
        inputText.setAttribute('value', currentTask.description);

        /**
         * We associate the event click on the button ok, to send a PUT request to the server.
         */
        let buttonOK = document.createElement('button');
        buttonOK.innerText = 'OK';
        buttonOK.style.color= "orange";
        buttonOK.style.backgroundColor = "white";
        buttonOK.style.borderRadius= "8px";
        buttonOK.style.padding= "6px 10px";
        buttonOK.setAttribute('id', `ok-button-${currentTask.id}`);
        buttonOK.onclick = () => {
            currentTask.description = document.getElementById(`task-edit-${currentTask.id}`).value;

            // TODO ITEM 2: llamar a la API con el método PUT cuando la descripción de la tarea es
            //  modificada (`currentTask`).
            //  - Como parámetro `callbackSuccess` envía una función que llame al método `revertHTMLChangeOnEdit`
            //    enviando la variable `currentTask`.
            //  - Como parámetro `callbackError` envía una función que llame al método `showError` enviando un mensaje de
            //    error
            //  - La llamada debe ser asíncrona.
            //  - No te olvides de envíar el parámetro para que se cree la tarea.
       
            let param = {
                "description": currentTask.description
            }
            Ajax.sendPutRequest(API_URL+"/"+currentTask.id, param , MediaFormat.JSON, (currentTask)=>revertHTMLChangeOnEdit(currentTask), 
            (error)=>showError(error), true);

    };

        let buttonCancel = document.createElement('button');
        buttonCancel.innerText = 'Cancelar';
        buttonCancel.style.color= "orange";
        buttonCancel.style.backgroundColor = "white";
        buttonCancel.style.borderRadius= "8px";
        buttonCancel.style.padding= "6px 10px";
        buttonCancel.setAttribute('id', `cancel-button-${currentTask.id}`);
        buttonCancel.onclick = () => revertHTMLChangeOnEdit(currentTask);
        currentDOMTask.insertBefore(buttonCancel, currentDOMTask.children[0]);
        currentDOMTask.insertBefore(buttonOK, currentDOMTask.children[0]);
        currentDOMTask.insertBefore(inputText, currentDOMTask.children[0]);

        currentDOMTask.querySelector('.edit').style.visibility = 'hidden';
        currentDOMTask.querySelector('.delete').style.visibility = 'hidden';

        inputText.focus();
    };

    /**
     * This method removes the form displayed to edit the task and show it as a task item.
     * @param currentTask the string coming from the API
     */
    const revertHTMLChangeOnEdit = (currentTask) => {
        let task = currentTask;//JSON.parse()

        let currentDOMTask = document.getElementById(`task-${task.id}`);
        currentDOMTask.querySelector('input[type=text]').remove();

        let label = document.createElement('label');

        currentDOMTask.insertBefore(label, currentDOMTask.children[0]);
        label.innerHTML =  `<input type="checkbox"/> ${task.description}`;
        addOnChangeEvent(task);
        addOnChangeEvent(task);

        currentDOMTask.insertBefore(label, currentDOMTask.children[0]);
        currentDOMTask.querySelector(`button#ok-button-${task.id}`).remove();
        currentDOMTask.querySelector(`button#cancel-button-${task.id}`).remove();

        currentDOMTask.querySelector('.edit').style.visibility = 'visible';
        currentDOMTask.querySelector('.delete').style.visibility = 'visible';
    };

    /**
     * This methods removes the task item associated to the DOM of the page
     * @param id the identifier from the task
     */
    const removeTaskFromList = (id) => {
        // TODO ITEM 4: remover del DOM HTML el elemento con id `task-${id}`
         let elemento = document.getElementById('task-${id}');
         elemento.removeChild();
         
    };

    /**
     * This method sends a DELETE request to remove the task from the server.
     * @param e
     */
    const removeTask = (e) => {
        const id = e.target.dataset.id;
        // TODO ITEM 5: enviar una petición DELETE al API con el {id} de la tarea.
        //   - Como parámetro `callbackSuccess` enviar una función que llamé al método `removeTaskFromList`
        //     enviando el id de la tarea.
        //   - Como parámetro `callbackError` enviar una función que llame al método `showError` enviando
        //     un mensaje de error
        //   - La llamada debe ser asíncrona.
        Ajax.sendDeleteRequest(API_URL+"/"+id,{}, MediaFormat.JSON,
            (callbackSuccess) => {
                                removeTaskFromList(id);
                                showSuccess(200,'Tarea Eliminada.')
                               },(error)=>showError(error), false);  

        removeTaskFromList(id);
    };
})();