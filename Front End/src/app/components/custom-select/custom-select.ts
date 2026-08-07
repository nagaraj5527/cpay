import { Component, Input, Output, EventEmitter, ElementRef, HostListener, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  label: string;
  value: any;
}

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-select.html',
  styleUrl: './custom-select.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSelectComponent),
      multi: true
    }
  ]
})
export class CustomSelectComponent implements ControlValueAccessor {
  @Input() options: (string | SelectOption)[] = [];
  @Input() placeholder: string = 'Select option';
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() customClass: string = '';
  @Input() dropUp: boolean = false;
  @Input() value: any = '';

  @Output() valueChange = new EventEmitter<any>();
  @Output() change = new EventEmitter<any>();

  isOpen: boolean = false;
  openUpward: boolean = false;

  onChange: any = () => {};
  onTouched: any = () => {};

  constructor(private elementRef: ElementRef) {}

  get formattedOptions(): SelectOption[] {
    if (!this.options) return [];
    return this.options.map(opt => {
      if (typeof opt === 'string' || typeof opt === 'number') {
        return { label: String(opt), value: opt };
      }
      return opt;
    });
  }

  get selectedOptionLabel(): string {
    const found = this.formattedOptions.find(o => o.value === this.value);
    if (found && found.value !== '' && found.value !== null && found.value !== undefined) {
      return found.label;
    }
    if (this.value !== '' && this.value !== null && this.value !== undefined) {
      return String(this.value);
    }
    return this.placeholder;
  }

  toggleOpen(): void {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        const el = this.elementRef.nativeElement;
        const rect = el.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const dropdownHeight = 240;

        if (this.dropUp || (spaceBelow < dropdownHeight && rect.top > dropdownHeight)) {
          this.openUpward = true;
        } else {
          this.openUpward = false;
        }

        setTimeout(() => {
          try {
            el.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest'
            });
          } catch (e) {
            el.scrollIntoView(true);
          }
        }, 50);
      } else {
        this.onTouched();
      }
    }
  }

  selectOption(opt: SelectOption, event: Event): void {
    event.stopPropagation();
    this.value = opt.value;
    this.onChange(this.value);
    this.onTouched();
    this.valueChange.emit(this.value);
    this.change.emit(this.value);
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      if (this.isOpen) {
        this.isOpen = false;
        this.onTouched();
      }
    }
  }

  writeValue(val: any): void {
    this.value = val !== undefined ? val : '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
