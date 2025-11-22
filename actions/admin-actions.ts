'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { APIError } from 'better-auth/api';
import { getTranslations } from 'next-intl/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@/lib/generated/prisma/client';
import type { ListUsersResult, AdminUser } from '@/types/Admin';

export async function ListUsersAction(
  searchValue?: string,
  searchField: 'email' | 'name' = 'email',
  limit: number = 100,
  offset: number = 0,
  sortBy: string = 'createdAt',
  sortDirection: 'asc' | 'desc' = 'desc',
): Promise<{ data?: ListUsersResult; error?: string }> {
  const t = await getTranslations('ServerActions');
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    return { error: t('unauthorized') };
  }

  const isAdmin =
    session.user.role === 'admin' || session.user.role === 'superadmin';

  if (!isAdmin) {
    return { error: t('unauthorized') };
  }

  try {
    const where: Prisma.UserWhereInput = {};
    if (searchValue) {
      if (searchField === 'email') {
        where.email = {
          contains: searchValue,
          mode: 'insensitive',
        };
      } else if (searchField === 'name') {
        where.name = {
          contains: searchValue,
          mode: 'insensitive',
        };
      }
    }

    const orderBy: Prisma.UserOrderByWithRelationInput = {};
    if (sortBy === 'email' || sortBy === 'name' || sortBy === 'createdAt') {
      orderBy[sortBy] = sortDirection;
    } else {
      orderBy.createdAt = sortDirection;
    }

    const total = await prisma.user.count({ where });

    const users = await prisma.user.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        banned: true,
        createdAt: true,
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    const usersWithTaskCounts: AdminUser[] = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      tasksCount: user._count.tasks,
      role: user.role,
      banned: user.banned,
      createdAt: user.createdAt,
    }));

    return {
      data: {
        users: usersWithTaskCounts,
        total,
        limit,
        offset,
      },
    };
  } catch (err) {
    console.error('ListUsersAction error:', err);
    return { error: t('internalServerError') };
  }
}

export async function UpdateUserAdminAction(
  userId: string,
  data: { name?: string; email?: string; role?: string },
): Promise<{ error?: string }> {
  const t = await getTranslations('ServerActions');
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    return { error: t('unauthorized') };
  }

  const currentUserRole = session.user.role;
  const isAdmin =
    currentUserRole === 'admin' || currentUserRole === 'superadmin';

  if (!isAdmin) {
    return { error: t('unauthorized') };
  }

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!targetUser) {
      return { error: t('userNotFound') || 'User not found' };
    }

    if (currentUserRole === 'admin') {
      if (targetUser.role === 'admin' || targetUser.role === 'superadmin') {
        return { error: t('cannotModifyAdmin') || 'Cannot modify admin users' };
      }
    } else if (currentUserRole === 'superadmin') {
      if (targetUser.role === 'superadmin') {
        return {
          error:
            t('cannotModifySuperadmin') || 'Cannot modify superadmin users',
        };
      }
    }

    const updateData: Prisma.UserUpdateInput = {};

    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }

    if (data.email !== undefined) {
      updateData.email = data.email.trim().toLowerCase();
    }

    if (data.role !== undefined) {
      if (data.role === 'superadmin' && currentUserRole !== 'superadmin') {
        return {
          error: t('cannotSetSuperadmin') || 'Cannot set superadmin role',
        };
      }
      updateData.role = data.role;
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return {};
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return { error: t('emailAlreadyExists') || 'Email already exists' };
      }
    }
    console.error('UpdateUserAdminAction error:', err);
    return { error: t('internalServerError') };
  }
}

export async function RemoveUserAction(
  userId: string,
): Promise<{ error?: string }> {
  const t = await getTranslations('ServerActions');
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    return { error: t('unauthorized') };
  }

  const currentUserRole = session.user.role;
  const isAdmin =
    currentUserRole === 'admin' || currentUserRole === 'superadmin';

  if (!isAdmin) {
    return { error: t('unauthorized') };
  }

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, id: true },
    });

    if (!targetUser) {
      return { error: t('userNotFound') || 'User not found' };
    }

    if (targetUser.id === session.user.id) {
      return { error: t('cannotDeleteYourself') || 'Cannot delete yourself' };
    }

    if (currentUserRole === 'admin') {
      if (targetUser.role === 'admin' || targetUser.role === 'superadmin') {
        return { error: t('cannotDeleteAdmin') || 'Cannot delete admin users' };
      }
    } else if (currentUserRole === 'superadmin') {
      if (targetUser.role === 'superadmin') {
        return {
          error:
            t('cannotDeleteSuperadmin') || 'Cannot delete superadmin users',
        };
      }
    }

    await auth.api.removeUser({
      headers: headersList,
      body: {
        userId,
      },
    });

    return {};
  } catch (err) {
    if (err instanceof APIError) {
      return { error: err.message };
    }
    console.error('RemoveUserAction error:', err);
    return { error: t('internalServerError') };
  }
}
