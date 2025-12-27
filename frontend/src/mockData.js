// Mock data for Instagram clone

export const mockUsers = [
  {
    id: '1',
    username: 'john_doe',
    fullName: 'John Doe',
    email: 'john@example.com',
    profilePicture: 'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxwcm9maWxlJTIwcGljdHVyZXxlbnwwfHx8fDE3NjY4NTU0NTF8MA&ixlib=rb-4.1.0&q=85',
    bio: 'Travel enthusiast | Photography lover',
    followers: 1234,
    following: 567,
    posts: 89
  },
  {
    id: '2',
    username: 'sarah_wilson',
    fullName: 'Sarah Wilson',
    email: 'sarah@example.com',
    profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwyfHxhdmF0YXJ8ZW58MHx8fHwxNzY2ODU1NDU2fDA&ixlib=rb-4.1.0&q=85',
    bio: 'Food blogger | Recipe creator',
    followers: 2341,
    following: 432,
    posts: 156
  },
  {
    id: '3',
    username: 'mike_photo',
    fullName: 'Mike Rodriguez',
    email: 'mike@example.com',
    profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxhdmF0YXJ8ZW58MHx8fHwxNzY2ODU1NDU2fDA&ixlib=rb-4.1.0&q=85',
    bio: 'Professional photographer',
    followers: 5678,
    following: 234,
    posts: 423
  },
  {
    id: '4',
    username: 'emma_lifestyle',
    fullName: 'Emma Thompson',
    email: 'emma@example.com',
    profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwzfHxhdmF0YXJ8ZW58MHx8fHwxNzY2ODU1NDU2fDA&ixlib=rb-4.1.0&q=85',
    bio: 'Lifestyle & Wellness',
    followers: 3421,
    following: 567,
    posts: 234
  },
  {
    id: '5',
    username: 'alex_fitness',
    fullName: 'Alex Brown',
    email: 'alex@example.com',
    profilePicture: 'https://images.unsplash.com/photo-1654110455429-cf322b40a906?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwyfHxwcm9maWxlJTIwcGljdHVyZXxlbnwwfHx8fDE3NjY4NTU0NTF8MA&ixlib=rb-4.1.0&q=85',
    bio: 'Fitness trainer | Healthy living',
    followers: 4532,
    following: 321,
    posts: 345
  }
];

export const mockStories = [
  {
    id: '1',
    userId: '2',
    username: 'sarah_wilson',
    profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwyfHxhdmF0YXJ8ZW58MHx8fHwxNzY2ODU1NDU2fDA&ixlib=rb-4.1.0&q=85',
    stories: [
      {
        id: 's1',
        imageUrl: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwxfHxmb29kfGVufDB8fHx8MTc2Njg1NTQ5OHww&ixlib=rb-4.1.0&q=85',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      }
    ]
  },
  {
    id: '2',
    userId: '3',
    username: 'mike_photo',
    profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxhdmF0YXJ8ZW58MHx8fHwxNzY2ODU1NDU2fDA&ixlib=rb-4.1.0&q=85',
    stories: [
      {
        id: 's2',
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxsaWZlc3R5bGV8ZW58MHx8fHwxNzY2ODU1NDkzfDA&ixlib=rb-4.1.0&q=85',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
      }
    ]
  },
  {
    id: '3',
    userId: '4',
    username: 'emma_lifestyle',
    profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwzfHxhdmF0YXJ8ZW58MHx8fHwxNzY2ODU1NDU2fDA&ixlib=rb-4.1.0&q=85',
    stories: [
      {
        id: 's3',
        imageUrl: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwzfHxsaWZlc3R5bGV8ZW58MHx8fHwxNzY2ODU1NDkzfDA&ixlib=rb-4.1.0&q=85',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    ]
  }
];

export const mockPosts = [
  {
    id: 'p1',
    userId: '2',
    username: 'sarah_wilson',
    userProfilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwyfHxhdmF0YXJ8ZW58MHx8fHwxNzY2ODU1NDU2fDA&ixlib=rb-4.1.0&q=85',
    imageUrl: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwxfHxmb29kfGVufDB8fHx8MTc2Njg1NTQ5OHww&ixlib=rb-4.1.0&q=85',
    caption: 'Perfect breakfast to start the day! 🥑✨',
    likes: 234,
    comments: [
      { id: 'c1', userId: '3', username: 'mike_photo', text: 'Looks delicious!', timestamp: new Date() },
      { id: 'c2', userId: '4', username: 'emma_lifestyle', text: 'Recipe please! 😍', timestamp: new Date() }
    ],
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    liked: false
  },
  {
    id: 'p2',
    userId: '3',
    username: 'mike_photo',
    userProfilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxhdmF0YXJ8ZW58MHx8fHwxNzY2ODU1NDU2fDA&ixlib=rb-4.1.0&q=85',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxsaWZlc3R5bGV8ZW58MHx8fHwxNzY2ODU1NDkzfDA&ixlib=rb-4.1.0&q=85',
    caption: 'Finding peace in Bali 🧘‍♂️ #meditation #travel',
    likes: 567,
    comments: [
      { id: 'c3', userId: '2', username: 'sarah_wilson', text: 'Amazing shot!', timestamp: new Date() }
    ],
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    liked: true
  },
  {
    id: 'p3',
    userId: '4',
    username: 'emma_lifestyle',
    userProfilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwzfHxhdmF0YXJ8ZW58MHx8fHwxNzY2ODU1NDU2fDA&ixlib=rb-4.1.0&q=85',
    imageUrl: 'https://images.unsplash.com/photo-1598468872842-d39d85892daf?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwyfHxsaWZlc3R5bGV8ZW58MHx8fHwxNzY2ODU1NDkzfDA&ixlib=rb-4.1.0&q=85',
    caption: 'Coffee and good reads ☕📖',
    likes: 432,
    comments: [],
    timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000),
    liked: false
  },
  {
    id: 'p4',
    userId: '2',
    username: 'sarah_wilson',
    userProfilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwyfHxhdmF0YXJ8ZW58MHx8fHwxNzY2ODU1NDU2fDA&ixlib=rb-4.1.0&q=85',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwyfHxmb29kfGVufDB8fHx8MTc2Njg1NTQ5OHww&ixlib=rb-4.1.0&q=85',
    caption: 'Healthy bowl full of goodness 🥗💚',
    likes: 345,
    comments: [
      { id: 'c4', userId: '5', username: 'alex_fitness', text: 'Perfect post-workout meal!', timestamp: new Date() }
    ],
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
    liked: false
  },
  {
    id: 'p5',
    userId: '3',
    username: 'mike_photo',
    userProfilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxhdmF0YXJ8ZW58MHx8fHwxNzY2ODU1NDU2fDA&ixlib=rb-4.1.0&q=85',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwzfHxmb29kfGVufDB8fHx8MTc2Njg1NTQ5OHww&ixlib=rb-4.1.0&q=85',
    caption: 'Pizza night 🍕',
    likes: 678,
    comments: [
      { id: 'c5', userId: '2', username: 'sarah_wilson', text: 'OMG yum!', timestamp: new Date() },
      { id: 'c6', userId: '4', username: 'emma_lifestyle', text: 'Pizza is life!', timestamp: new Date() }
    ],
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    liked: true
  }
];

// Current logged in user (mock)
export const currentUser = {
  id: '1',
  username: 'john_doe',
  fullName: 'John Doe',
  email: 'john@example.com',
  profilePicture: 'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxwcm9maWxlJTIwcGljdHVyZXxlbnwwfHx8fDE3NjY4NTU0NTF8MA&ixlib=rb-4.1.0&q=85',
  bio: 'Travel enthusiast | Photography lover',
  followers: 1234,
  following: 567,
  posts: 89
};