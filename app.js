
let tasks = [
    { id: 1, title: "Planificar reunión de ACS", description: "Preparar la agenda y los roles.", dueDate: new Date().toISOString().slice(0, 10), isCompleted: false },

    { id: 2, title: "Implementar login de usuario (PENDIENTE)", description: "Crear la vista y el controlador para autenticación.", dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), isCompleted: false },
   
    { id: 3, title: "Revisar estilos de la UI (COMPLETADO)", description: "Asegurar que el diseño sea responsive.", dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), isCompleted: true }
];
let nextId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
let currentFilter = 'all';


const TaskValidatorBLL = {
    validateNewTask: (title, dueDate) => {
        if (!title || !dueDate) {
            return { success: false, message: 'El título y la fecha límite son obligatorios.' };
        }
        const today = new Date().setHours(0, 0, 0, 0);
        const due = new Date(dueDate).setHours(0, 0, 0, 0);

        if (due < today) {
            return { success: false, message: 'La fecha límite no puede ser en el pasado. ¡Revisa tu planificación!' };
        }
        return { success: true };
    }
};


const SCM_LoggerBLL = {
    logAction: (role, action, justification) => {
        const timestamp = new Date().toLocaleString();
        console.log(`[ACS - Commit][${timestamp}] Rol: ${role} | Acción: ${action} | Justificación: ${justification}`);
    }
};



function showMessage(message, type = 'info') {
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = message;
    messageBox.className = 'fixed bottom-4 right-4 p-3 text-white rounded-lg shadow-xl transition-all duration-300 z-50';

    switch (type) {
        case 'success':
            messageBox.classList.add('bg-success-green');
            break;
        case 'warning':
            messageBox.classList.add('bg-yellow-600');
            break;
        case 'error':
            messageBox.classList.add('bg-red-600');
            break;
        default:
            messageBox.classList.add('bg-primary-blue');
    }

    messageBox.classList.remove('hidden');

    setTimeout(() => {
        messageBox.classList.add('hidden');
    }, 3000);
}


function setFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('bg-primary-blue', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
    });
  
    const activeFilterButton = document.getElementById(`filter-${filter}`);
    if (activeFilterButton) {
        activeFilterButton.classList.remove('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
        activeFilterButton.classList.add('bg-primary-blue', 'text-white');
    }
    renderTasks();
}


function updateTaskCounts() {
    const pendingCount = tasks.filter(t => !t.isCompleted).length;
    document.getElementById('totalTasksCount').innerHTML = `<i class="bi bi-list-task mr-1"></i> Total: ${tasks.length}`;
    document.getElementById('pendingTasksCount').innerHTML = `<i class="bi bi-clock-fill mr-1"></i> Pendientes: ${pendingCount}`;
}


function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    let filteredTasks = tasks;
    if (currentFilter === 'pending') {
        filteredTasks = tasks.filter(t => !t.isCompleted);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(t => t.isCompleted);
    }

   
    filteredTasks.sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) {
            return a.isCompleted ? 1 : -1;
        }
        return new Date(a.dueDate) - new Date(b.dueDate);
    });

    if (filteredTasks.length === 0) {
        const filterText = currentFilter === 'pending' ? 'pendientes' : (currentFilter === 'completed' ? 'completadas' : 'registradas');
        taskList.innerHTML = `<div class="alert bg-white p-4 text-gray-500 rounded-lg shadow-md"><i class="bi bi-info-circle mr-2"></i> No hay tareas ${filterText} para mostrar.</div>`;
        updateTaskCounts();
        return;
    }

    filteredTasks.forEach(task => {
        const isCompleted = task.isCompleted;
        const taskClass = isCompleted ? 'task-completed' : 'task-pending';
        const buttonColor = isCompleted ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-success-green hover:bg-green-700';
        const buttonIcon = isCompleted ? 'bi-arrow-counterclockwise' : 'bi-check-lg';
        const buttonText = isCompleted ? 'Reabrir' : 'Lista';

        const taskElement = `
            <div class="task-item p-4 flex items-center justify-between ${taskClass}">
                <div class="flex-grow min-w-0 pr-4">
                    ${isCompleted
                ? `<span class="task-title text-base font-medium">${task.title}</span><span class="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-success-green/20 text-success-green">Completada</span>`
                : `<i class="bi bi-clock-fill text-red-500 mr-2"></i>
                            <strong class="task-title text-gray-900 text-base">${task.title}</strong>`
            }
                    <p class="text-xs text-gray-500 mt-1 truncate">Límite: ${task.dueDate}</p>
                    ${task.description ? `<p class="text-sm text-gray-600 mt-1">${task.description}</p>` : ''}
                </div>

                <div class="flex space-x-2 flex-shrink-0">
                    <button onclick="toggleCompletion(${task.id})"
                                class="text-white text-sm py-1 px-3 rounded-full ${buttonColor} transition duration-150">
                        <i class="bi ${buttonIcon}"></i> ${buttonText}
                    </button>

                    <button onclick="confirmDelete(${task.id})"
                                class="bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded-full transition duration-150"
                                title="Eliminar Tarea">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
        taskList.innerHTML += taskElement;
    });
    updateTaskCounts();
}


function addTask(e) {
    e.preventDefault();

    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const dueDate = document.getElementById('dueDate').value;

   
    const validationResult = TaskValidatorBLL.validateNewTask(title, dueDate);

    if (!validationResult.success) {
        showMessage(validationResult.message, 'warning');
        return;
    }

    const newTask = {
        id: nextId++,
        title: title,
        description: description,
        dueDate: dueDate,
        isCompleted: false
    };

    tasks.push(newTask);

    
    SCM_LoggerBLL.logAction('Integrante', 'Añadir Tarea', 'Nueva tarea registrada para seguimiento.');

    document.getElementById('taskForm').reset();
    renderTasks();
    showMessage('Tarea añadida con éxito.', 'success');
}

function toggleCompletion(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.isCompleted = !task.isCompleted;

        const status = task.isCompleted ? 'Completada' : 'Reabierta';
        SCM_LoggerBLL.logAction('Usuario/Tester', 'Cambio de Estado', `Tarea ID ${id} marcada como ${status}.`);

        renderTasks();
        showMessage(`Tarea marcada como ${status}.`, 'info');
    }
}


function confirmDelete(id) {
    
    if (window.confirm('¿Está seguro de que desea eliminar esta tarea permanentemente?')) {
        deleteTask(id);
    }
}

function deleteTask(id) {
    const initialLength = tasks.length;
    tasks = tasks.filter(t => t.id !== id);

    if (tasks.length < initialLength) {
       
        SCM_LoggerBLL.logAction('Usuario', 'Eliminar Tarea', `Tarea ID ${id} eliminada por solicitud del usuario.`);

        renderTasks();
        showMessage('Tarea eliminada con éxito.', 'error');
    }
}


window.onload = () => {
   
    window.setFilter = setFilter;
    window.addTask = addTask;
    window.toggleCompletion = toggleCompletion;
    window.confirmDelete = confirmDelete;

    setFilter('all'); 
};