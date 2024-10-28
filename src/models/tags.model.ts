import prisma from "@/lib/prisma";
import { GetTagsProps } from "@/lib/types";
import { Prisma, TagStatus } from "@prisma/client";

export const getTags = async (query?: GetTagsProps) => {
  const _query: Prisma.TagWhereInput = {};

  if (query?.status) {
    _query.status = query?.status;
  }

  const totalCount = await prisma.tag.count({ where: _query });

  const data = await prisma.tag.findMany({
    where: _query,
    orderBy: {
      created_at: "desc", // Sorting in descending order (latest first)
    },
    take: 2, // Limiting to the last 2 entries
  });

  return {
    data,
    meta: {
      totalCount,
    },
  };
};

export const deleteOldUnlinkedTags = async () => {
  const unlinkedTags = await prisma.tag.findMany({
    where: {
      vehicles: {
        none: {}, // No associated vehicles
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });

  if (unlinkedTags.length > 2) {
    const tagIdsToDelete = unlinkedTags.slice(2).map((tag) => tag.id);

    await prisma.tag.deleteMany({
      where: {
        id: {
          in: tagIdsToDelete, // Delete all but the latest two
        },
      },
    });
  }
  console.log("Successfully deleted old unlinked tags");
};
