// PWA Task Manager - Simple and Clean
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.deferredPrompt = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderTasks();
        this.registerServiceWorker();
        this.handleInstallPrompt();
    }

    bindEvents() {
        const taskInput = document.getElementById('taskInput');
        const addBtn = document.getElementById('addBtn');
        const clearBtn = document.getElementById('clearBtn');

        // Add task on button click or Enter key
        addBtn.addEventListener('click', () => this.addTask());
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Clear all tasks
        clearBtn.addEventListener('click', () => this.clearAllTasks());
    }

    addTask() {
        const taskInput = document.getElementById('taskInput');
        const taskText = taskInput.value.trim();

        if (!taskText) {
            this.showMessage('Please enter a task!', 'error');
            return;
        }

        if (taskText.length > 50) {
            this.showMessage('Task is too long! Maximum 50 characters.', 'error');
            return;
        }

        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(newTask);
        this.saveTasks();
        this.renderTasks();
        taskInput.value = '';
        
        this.showMessage('Task added successfully! ✅', 'success');
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
        }
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveTasks();
        this.renderTasks();
        this.showMessage('Task deleted! 🗑️', 'info');
    }

    clearAllTasks() {
        if (this.tasks.length === 0) {
            this.showMessage('No tasks to clear!', 'info');
            return;
        }

        if (confirm('Are you sure you want to delete all tasks?')) {
            this.tasks = [];
            this.saveTasks();
            this.renderTasks();
            this.showMessage('All tasks cleared! 🧹', 'info');
        }
    }

    renderTasks() {
        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');

        if (this.tasks.length === 0) {
            taskList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        taskList.style.display = 'block';
        emptyState.style.display = 'none';

        taskList.innerHTML = this.tasks.map(task => `
            <li class="task-item ${task.completed ? 'completed' : ''}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                     onclick="taskManager.toggleTask(${task.id})">
                    ${task.completed ? '✓' : ''}
                </div>
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <button class="delete-btn" onclick="taskManager.deleteTask(${task.id})" 
                        title="Delete task">🗑️</button>
            </li>
        `).join('');
    }

    loadTasks() {
        try {
            const stored = localStorage.getItem('pwa-tasks');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }

    saveTasks() {
        try {
            localStorage.setItem('pwa-tasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Error saving tasks:', error);
            this.showMessage('Error saving tasks!', 'error');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showMessage(message, type = 'info') {
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
            ${type === 'success' ? 'background: #10b981;' : ''}
            ${type === 'error' ? 'background: #ef4444;' : ''}
            ${type === 'info' ? 'background: #3b82f6;' : ''}
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Service Worker Registration
    async registerServiceWorker() {
        // Check if Service Workers are supported and not in StackBlitz environment
        if ('serviceWorker' in navigator && !this.isStackBlitzEnvironment()) {
            try {
                const registration = await navigator.serviceWorker.register('./sw.js');
                console.log('Service Worker registered successfully');
                
                // Handle updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showMessage('App updated! Refresh to see changes.', 'info');
                        }
                    });
                });
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        } else {
            console.log('Service Workers not supported or running in StackBlitz environment');
        }
    }

    // Check if running in StackBlitz environment
    isStackBlitzEnvironment() {
        return window.location.hostname.includes('stackblitz') || 
               window.location.hostname.includes('webcontainer');
    }

    // PWA Install Prompt
    handleInstallPrompt() {
        const installPrompt = document.getElementById('installPrompt');
        const installBtn = document.getElementById('installBtn');
        const dismissBtn = document.getElementById('dismissBtn');

        // Listen for the install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            
            // Don't show if already dismissed or installed
            if (!localStorage.getItem('install-dismissed') && !this.isPWAInstalled()) {
                installPrompt.classList.remove('hidden');
            }
        });

        // Handle install button click
        installBtn.addEventListener('click', async () => {
            if (this.deferredPrompt) {
                this.deferredPrompt.prompt();
                const { outcome } = await this.deferredPrompt.userChoice;
                
                if (outcome === 'accepted') {
                    this.showMessage('Thanks for installing! 🎉', 'success');
                }
                
                this.deferredPrompt = null;
                installPrompt.classList.add('hidden');
            }
        });

        // Handle dismiss button
        dismissBtn.addEventListener('click', () => {
            installPrompt.classList.add('hidden');
            localStorage.setItem('install-dismissed', 'true');
        });

        // Hide prompt if already installed
        window.addEventListener('appinstalled', () => {
            installPrompt.classList.add('hidden');
            this.showMessage('App installed successfully! 🎉', 'success');
        });
    }

    isPWAInstalled() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true;
    }
}

// Initialize the app
const taskManager = new TaskManager();

// Add some additional PWA features
window.addEventListener('online', () => {
    taskManager.showMessage('Back online! 🌐', 'success');
});

window.addEventListener('offline', () => {
    taskManager.showMessage('You\'re offline. App will still work! 📱', 'info');
});

// Add CSS for toast animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100px); }
    }
`;
document.head.appendChild(style);