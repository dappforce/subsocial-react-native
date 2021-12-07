import { Opt } from "src/types"
import { AccountId, PostContent, PostData, PostStruct, ProfileContent, ProfileData, ProfileStruct } from "src/types/subsocial"

const postMixin = {
  struct: {
    createdAtBlock: 69420,
    createdAtTime: 1569098983,
    createdByAccount: '0',
    hidden: false,
    isComment: true,
    contentId: undefined,
    isRegularPost: true,
    isSharedPost: false,
    isUpdated: false,
    score: 0,
    repliesCount: 0,
    visibleRepliesCount: 0,
    hiddenRepliesCount: 0,
    sharesCount: 0,
    spaceId: '0',
    downvotesCount: 0,
    upvotesCount: 0,
  },
  content: {
    summary: '',
    canonical: '',
    title: '',
    image: '',
    isShowMore: false,
    tags: [],
  },
}

const profileMixin = {
  struct: {
    followersCount: 0,
    followingAccountsCount: 0,
    followingSpacesCount: 0,
    hasProfile: true,
    reputation: 0,
  },
  content: {
    about: '',
    avatar: '',
    summary: '',
    isShowMore: false,
  },
}

function makeProfile(id: string, name: string): ProfileData {
  return {
    id,
    struct: {
      ...profileMixin.struct,
      id,
    },
    content: {
      ...profileMixin.content,
      name,
    }
  }
}

export const DummyThreadData = {
  parentComment: {
    id: '42',
    struct: {
      ...postMixin.struct,
      id: '42',
      ownerId: 'op',
    },
    content: {
      ...postMixin.content,
      body: 'Parent comment',
    },
  } as PostData,
  replies: [
    {
      id: '43',
      struct: {
        ...postMixin.struct,
        id: '43',
        ownerId: 'commenter1',
      },
      content: {
        ...postMixin.content,
        body: 'Reply 1',
      },
    },
  ] as PostData[],
  profiles: {
    op: makeProfile('op', 'Original Poster'),
    commenter1: makeProfile('commenter1', 'Commenter 1'),
  } as Record<AccountId, Opt<ProfileData>>,
}
