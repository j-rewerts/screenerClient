import { Component }            from '@angular/core';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component';
import { QuestionService }      from './Question/data/question.service';
@Component({
  selector: 'my-app',
  template: `
    <div>
      <h2>Job Application for Heroes</h2>
      <dynamic-form [questions]="questions"></dynamic-form>
    </div>
  `,
  directives: [DynamicFormComponent],
  providers:  [QuestionService]
})
export class AppComponent {
  questions: Object;
  constructor(service: QuestionService) {
    this.questions = service.getQuestions();
  }
}
