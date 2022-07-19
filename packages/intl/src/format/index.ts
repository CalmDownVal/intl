import { SelectFormat } from './SelectFormat';
import { DateTimeFormat } from './time/DateTimeFormat';
import { VariableFormat } from './VariableFormat';

export * from './SelectFormat';
export * from './time/DateTimeFormat';
export * from './VariableFormat';

export const BUILTIN_FORMATS = {
	select: SelectFormat,
	variable: VariableFormat,
	date: DateTimeFormat,
	time: DateTimeFormat
};
