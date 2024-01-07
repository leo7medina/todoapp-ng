import { CommonModule } from '@angular/common';
import { Component, Injector, computed, effect, inject, signal } from '@angular/core';
import { Task } from '../../models/task.model';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FilterEnum } from '../../enums/filtes.enum';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  filterEnum = FilterEnum;
  filter = signal(FilterEnum.ALL);
  tasks = signal<Task[]>([]);
  taskByFilter = computed( () => {
    const currentFilter = this.filter();
    const tasks = this.tasks();
    if (currentFilter === FilterEnum.PENDING) {
      return this.tasks().filter(task => !task.completed);
    } else if (currentFilter === FilterEnum.COMPLETED) {
      return this.tasks().filter(task => task.completed);
    } else {
      return tasks;
    }
  });
  newTaskControl = new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required
    ]
  });

  injector = inject(Injector);

  ngOnInit() {
    const storage = localStorage.getItem('tasks');
    if (storage) {
      const tasks: Task[] = JSON.parse(storage);
      this.tasks.set(tasks);
    }
    this.trackTasks()
  }

  trackTasks() {
    effect( () => {
      const tasks = this.tasks();
      console.log(tasks);
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }, {injector: this.injector})
  }

  changeHandler(event: Event) {
    if (this.newTaskControl.valid) {
      const value = this.newTaskControl.value.trim();
      if (value.length > 0) {
        this.addTask(value);
        this.newTaskControl.setValue('');
      }
    }
    // const input = event.target as HTMLInputElement;
    // const newTask = input.value;
    // if (newTask.trim().length > 0) {
    //   this.addTask(newTask);
    // }
  }

  addTask(title: string) {
    const newTask = {
      id: Date.now(),
      title: title,
      completed: false
    }
    this.tasks.update(prevState => [...prevState, newTask]);
  }

  deleteTask(index: number) {
    this.tasks.update((tasks) => tasks.filter((task, position) => position !== index));
    // this.tasks.mutate(state => {
    //   state.splice(index, 1);
    // })
  }

  updateTask(index: number) {
    this.tasks.update(tasks => {
      return tasks.map( (task, position) => {
        if (position === index) {
          return {
            ...task, completed: !task.completed
          }
        }
        return task;
      })
    });
  }

  updateTaskEditingMode(index: number) {
    this.tasks.update(tasks => {
      return tasks.map( (task, position) => {
        if (position === index && !task.completed) {
          return {...task, editing: true}
        }
        return {...task, editing: false}
      })
    })
  }

  updateTaskText(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    this.tasks.update(prevState => {
      return prevState.map( (task, position) => {
        if (position === index) {
          return { ...task, title: input.value, editing: false}
        }
        return task;
      });
    })
  }
  updateTaskText2(index: number,event: Event, task: Task) {
      const input = event.target as HTMLInputElement;
      task.title = input.value;
      task.editing = false;
  }

  changeFilter(filter: FilterEnum) {
    this.filter.set(filter);
  }

  clearCompleted() {
    this.tasks.update( tasks => tasks.filter(task => !task.completed));
  }

}
