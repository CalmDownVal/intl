import { DateTimeFormat } from './DateTimeFormat/DateTimeFormat';
import { SelectFormat } from './SelectFormat';
import { VariableFormat } from './VariableFormat';

export * from './DateTimeFormat/DateTimeFormat';
export * from './SelectFormat';
export * from './VariableFormat';

export const BUILTIN_FORMATS = {
	select: SelectFormat,
	variable: VariableFormat,
	date: DateTimeFormat,
	time: DateTimeFormat
};
