'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTranslations } from 'next-intl';
import type { AdminUser } from '@/actions/admin-actions';
import { toast } from 'sonner';
import { ViewUserDialog } from './view-user-dialog';
import { EditUserDialog } from './edit-user-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RemoveUserAction } from '@/actions/admin-actions';

export const getColumns = (
  t: (key: string) => string,
): ColumnDef<AdminUser>[] => [
  {
    accessorKey: 'id',
    id: 'id',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='h-8'
        >
          {t('id')}
          <Icon icon='lucide:arrow-up-down' className='ml-2 size-4' />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className='font-mono text-xs'>
        {`${(row.getValue('id') as string).substring(0, 10)}...`}
      </div>
    ),
  },
  {
    accessorKey: 'name',
    id: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {t('name')}
          <Icon icon='lucide:arrow-up-down' className='ml-2 size-4' />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'email',
    id: 'email',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          {t('email')}
          <Icon icon='lucide:arrow-up-down' className='ml-2 size-4' />
        </Button>
      );
    },
    cell: ({ row }) => <div className='lowercase'>{row.getValue('email')}</div>,
  },
  {
    accessorKey: 'tasksCount',
    id: 'tasks',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='h-8'
        >
          {t('tasks')}
          <Icon icon='lucide:arrow-up-down' className='size-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const count = row.original.tasksCount;
      return <div className='ml-4 font-medium'>{count}</div>;
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row, table }) => {
      const user = row.original;
      const meta = table.options.meta as
        | {
            setSelectedUser: (user: AdminUser) => void;
            setIsViewDialogOpen: (open: boolean) => void;
            setEditUser: (user: AdminUser) => void;
            setIsEditDialogOpen: (open: boolean) => void;
            setDeleteUser: (user: AdminUser) => void;
            setIsDeleteDialogOpen: (open: boolean) => void;
          }
        | undefined;

      const getUserId = (id: string) => {
        window.navigator.clipboard.writeText(id);
        toast.success(t('copyUserIdSuccess'));
      };

      const handleViewUser = () => {
        if (meta) {
          meta.setSelectedUser(user);
          meta.setIsViewDialogOpen(true);
        }
      };

      const handleEditUser = () => {
        if (meta) {
          meta.setEditUser(user);
          meta.setIsEditDialogOpen(true);
        }
      };

      const handleDeleteUser = () => {
        if (meta) {
          meta.setDeleteUser(user);
          meta.setIsDeleteDialogOpen(true);
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>{t('openMenu')}</span>
              <Icon icon='lucide:more-horizontal' className='size-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            sideOffset={4}
            className='dark:bg-[#1d1929]'
            align='end'
          >
            <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => getUserId(user.id)}>
              {t('copyUserId')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleViewUser}>
              {t('viewUser')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEditUser}>
              {t('editUser')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDeleteUser}
              className='text-destructive focus:text-destructive'
            >
              {t('deleteUser')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface UsersDataTableProps {
  data: AdminUser[];
}

export function UsersDataTable({ data }: UsersDataTableProps) {
  const t = useTranslations('SettingsPage.admin.table');
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedUser, setSelectedUser] = React.useState<AdminUser | null>(
    null,
  );
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const [editUser, setEditUser] = React.useState<AdminUser | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [deleteUser, setDeleteUser] = React.useState<AdminUser | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const columns = React.useMemo(() => getColumns((key: string) => t(key)), [t]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    meta: {
      setSelectedUser,
      setIsViewDialogOpen,
      setEditUser,
      setIsEditDialogOpen,
      setDeleteUser,
      setIsDeleteDialogOpen,
    },
  });

  return (
    <div className='w-full'>
      <div className='flex items-center py-4'>
        <Input
          placeholder={t('filterEmails')}
          value={(table.getColumn('email')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('email')?.setFilterValue(event.target.value)
          }
          className='max-w-sm'
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='ml-auto'>
              {t('columns')}{' '}
              <Icon icon='lucide:chevron-down' className='ml-2 size-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            sideOffset={4}
            className='dark:bg-[#1d1929]'
            align='end'
          >
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                const columnNames: Record<string, string> = {
                  id: t('id'),
                  name: t('name'),
                  email: t('email'),
                  tasks: t('tasks'),
                };
                const columnName = columnNames[column.id] || column.id;
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className='capitalize'
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {columnName}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={getColumns((key: string) => t(key)).length}
                  className='h-24 text-center'
                >
                  {t('noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex items-center justify-end space-x-2 py-4'>
        <div className='space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {t('previous')}
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {t('next')}
          </Button>
        </div>
      </div>

      <ViewUserDialog
        user={selectedUser}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      />

      <EditUserDialog
        user={editUser}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={() => {
          // Refresh the table data
          window.location.reload();
        }}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='sr-only'>
              {t('deleteDialog.title')}
            </AlertDialogTitle>
            <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteDialog.description', { name: deleteUser?.name || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t('deleteDialog.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleteUser) return;

                setIsDeleting(true);
                try {
                  const result = await RemoveUserAction(deleteUser.id);

                  if (result.error) {
                    toast.error(result.error);
                    return;
                  }

                  toast.success(t('deleteDialog.success'));
                  setIsDeleteDialogOpen(false);
                  window.location.reload();
                } catch (error) {
                  console.error(error);
                  toast.error(t('deleteDialog.error'));
                } finally {
                  setIsDeleting(false);
                }
              }}
              disabled={isDeleting}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {isDeleting
                ? t('deleteDialog.deleting')
                : t('deleteDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
