export interface DialogData<T> {
  mode: 'add' | 'edit';
  data?: T;
  title: string;
}

export interface DialogResult<T> {
  action: 'save' | 'cancel';
  data?: T;
}