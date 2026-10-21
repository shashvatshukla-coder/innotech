import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className="w-full overflow-x-auto border border-slate-200 rounded-lg bg-white shadow-card">
    <table className={twMerge(clsx('w-full text-left border-collapse text-sm', className))} {...props}>
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => (
  <thead className={twMerge(clsx('bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider', className))} {...props}>
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => (
  <tbody className={twMerge(clsx('divide-y divide-slate-100 text-slate-700', className))} {...props}>
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement> & { isClickable?: boolean }> = ({
  className,
  isClickable = false,
  children,
  ...props
}) => (
  <tr
    className={twMerge(
      clsx(
        'transition-colors h-11',
        isClickable ? 'cursor-pointer hover:bg-slate-50/80' : 'hover:bg-slate-50/40',
        className
      )
    )}
    {...props}
  >
    {children}
  </tr>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => (
  <th className={twMerge(clsx('px-3.5 py-2.5 text-xs font-semibold text-slate-600 select-none', className))} {...props}>
    {children}
  </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => (
  <td className={twMerge(clsx('px-3.5 py-2 text-sm text-slate-700 whitespace-nowrap', className))} {...props}>
    {children}
  </td>
);
