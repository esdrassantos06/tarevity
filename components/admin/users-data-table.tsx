'use client';

import {
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type RowSelectionState,
  type SortingState,
  columnFilteringFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  flexRender,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
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
import type { AdminUser } from '@/types/admin';
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
import type { ListUsersResult } from '@/types/admin';
import { useMemo, useState } from 'react';
import { Stamp } from '@/components/forms/stamp';

const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
});

const sortButtonClass =
  'text-print -ml-2 h-8 px-2 text-[0.6875rem] font-semibold tracking-[0.08em] uppercase';

export const getColumns = (
  t: (key: string) => string,
): ColumnDef<typeof features, AdminUser>[] => [
  {
    accessorKey: 'id',
    id: 'id',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className={sortButtonClass}
        >
          {t('id')}
          <Icon icon='tabler:arrows-sort' className='size-3.5' />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className='typed text-xs' title={row.getValue('id') as string}>
        {`${(row.getValue('id') as string).substring(0, 6)}...`}
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
          className={sortButtonClass}
        >
          {t('name')}
          <Icon icon='tabler:arrows-sort' className='size-3.5' />
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
          className={sortButtonClass}
        >
          {t('email')}
          <Icon icon='tabler:arrows-sort' className='size-3.5' />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className='typed text-sm lowercase'>{row.getValue('email')}</div>
    ),
  },
  {
    accessorKey: 'role',
    id: 'role',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className={sortButtonClass}
        >
          {t('role')}
          <Icon icon='tabler:arrows-sort' className='size-3.5' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const role = row.getValue('role') as string | null;
      const isAdmin = role === 'admin';
      return (
        <div className='flex items-center gap-3'>
          {isAdmin ? (
            <Stamp tone='violet' rotate={-3} className='text-[0.7rem]'>
              {t('roleAdmin')}
            </Stamp>
          ) : (
            <span className='text-muted-foreground text-sm'>
              {t('roleUser')}
            </span>
          )}
          {row.original.banned && (
            <Stamp tone='red' rotate={2} className='text-[0.7rem]'>
              {t('viewUserDialog.banned')}
            </Stamp>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'tasksCount',
    id: 'tasks',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className={sortButtonClass}
        >
          {t('tasks')}
          <Icon icon='tabler:arrows-sort' className='size-3.5' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const count = row.original.tasksCount;
      return <div className='typed text-sm'>{count}</div>;
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
            <Button variant='ghost' size='icon-sm'>
              <span className='sr-only'>{t('openMenu')}</span>
              <Icon icon='tabler:dots' className='size-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={4} align='end'>
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
            <DropdownMenuItem onClick={handleDeleteUser} variant='destructive'>
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
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
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

  const table = useTable({
    features,
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
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
      <div className='flex items-center gap-3 py-4'>
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
              {t('columns')}
              <Icon icon='tabler:chevron-down' className='size-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={4} align='end'>
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                const columnNames: Record<string, string> = {
                  id: t('id'),
                  name: t('name'),
                  email: t('email'),
                  role: t('role'),
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
      <div className='sheet overflow-hidden rounded-[3px] px-2'>
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
                  className='text-muted-foreground h-24 text-center'
                >
                  {t('noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex items-center justify-end py-4'>
        <div className='flex gap-2'>
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
