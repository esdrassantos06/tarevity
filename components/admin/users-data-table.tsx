'use client';

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
import { Button, buttonVariants } from '@/components/ui/button';
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
import type { AdminUser } from '@/types/Admin';
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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ListUsersResult } from '@/types/Admin';
import { useMemo, useState } from 'react';

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
            <Button variant='ghost' className='size-8 p-0'>
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
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const result = await RemoveUserAction(userId);
      if (result.error) {
        throw new Error(result.error);
      }
      return userId;
    },
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ['admin-users'] });

      const previousData = queryClient.getQueryData<ListUsersResult>([
        'admin-users',
      ]);

      if (previousData) {
        queryClient.setQueryData<ListUsersResult>(['admin-users'], {
          ...previousData,
          users: previousData.users.filter((user) => user.id !== userId),
          total: previousData.total - 1,
        });
      }

      return { previousData };
    },
    onError: (err, _, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['admin-users'], context.previousData);
      }
      const errorMessage =
        err instanceof Error ? err.message : t('deleteDialog.error');
      toast.error(errorMessage);
    },
    onSuccess: () => {
      toast.success(t('deleteDialog.success'));
      setIsDeleteDialogOpen(false);
      setDeleteUser(null);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const columns = useMemo(() => getColumns((key: string) => t(key)), [t]);

  // eslint-disable-next-line react-hooks/incompatible-library
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
          queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        }}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setDeleteUser(null);
          }
        }}
      >
        <AlertDialogContent className='dark:bg-[#1d1929]'>
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
            <AlertDialogCancel
              disabled={deleteUserMutation.isPending}
              onClick={() => {
                setDeleteUser(null);
              }}
            >
              {t('deleteDialog.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deleteUser) return;
                deleteUserMutation.mutate(deleteUser.id);
              }}
              disabled={deleteUserMutation.isPending}
              className={buttonVariants({ variant: 'destructive' })}
            >
              {deleteUserMutation.isPending
                ? t('deleteDialog.deleting')
                : t('deleteDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
