import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ScreenerModel } from '../screener-model';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subscription } from 'rxjs/Subscription';


@Component({
  selector: 'app-screener-overview',
  templateUrl: './screener-overview.component.html',
  styleUrls: ['./screener-overview.component.css'],
})
export class ScreenerOverviewComponent implements OnInit {
  questions: any[];
  selectedQuestion: any[] = [];
  selectedQuestion$ = new ReplaySubject<any>(1);
  subscriptions: Subscription[];
  constructor(public model: ScreenerModel) { }

  ngOnInit() {
    // small bootstrap...
    const bootstrap = this.model.load().subscribe(data => console.log(data));
    
    const questions = this.model.questions$.subscribe( (questions: any[]) => {
      this.questions = [ ...questions.sort( (a,b) => a.index - b.index) ];
      if (this.questions.length > 0 && this.selectedQuestion.length === 0) {
        this.selectedQuestion = [ this.questions[0] ];
        this.selectedQuestion$.next( this.questions[0] );
      }
    })

    const keyFilter = this.model.keyFilter$
      .subscribe( keyName => {
        const regexp = new RegExp(keyName);
        this.selectedQuestion = [  ];
        this.selectedQuestion$.next({});
        let filterQuestion = this.questions.find(question => regexp.test(question.key))
        if (filterQuestion) {
          this.selectedQuestion = [ filterQuestion ];
          this.selectedQuestion$.next( filterQuestion );
        } else {
          for(const q of this.questions) {
            if (q.expandable) {
              const conditionalQuestions = this.model.findConditionals(q);
              filterQuestion = conditionalQuestions.find(question => regexp.test(question.key));
              if (filterQuestion){
                this.selectedQuestion = [ q ];
                this.selectedQuestion$.next( q );
                break;
              }
            }
          }
        }
        
      });
    this.subscriptions = [bootstrap, questions, keyFilter];
  }

  ngOnDestroy() {
    for(const sub of this.subscriptions) {
      if (!sub.closed){
        sub.unsubscribe();
      }
    }
  }

  handleSelect(question) {
    const newSelection = this.questions.find(q => q.id === question.id);
    if (newSelection) this.selectedQuestion = [ newSelection ];
  }

  updateOverview(selectedQuestion, $event){
    const updateQuestion = this.questions.find(question => question.id === selectedQuestion.id);
    if (updateQuestion) {
      updateQuestion.key = $event;
    }
  }

  handleSwap($event) {
    this.model.swapQuestions($event.sourceQuestion, $event.targetKeyName);
  }

  handleDelete(question) {
    this.questions = this.questions.filter(q => q.id !== question.id);
    if (this.questions.length > 0) {
      this.handleSelect(this.questions[0])
      this.selectedQuestion$.next(this.questions[0])
    } else {
      this.selectedQuestion = [];
      this.selectedQuestion$.next({});
    }
  }

}