/**
 * Journal entry templates
 */

const templates = {
  blank: {
    name: 'Blank Entry',
    description: 'Start with a clean slate',
    content: ''
  },
  dailyReflection: {
    name: 'Daily Reflection',
    description: "Reflect on your day's experiences",
    content: `## How I Feel Today

Write about your overall mood and emotions today...

## Three Accomplishments Today
1. 
2. 
3. 

## Challenges Faced
- 

## What I Learned Today

## Tomorrow's Focus
- 
`
  },
  gratitudeJournal: {
    name: 'Gratitude Journal',
    description: "Focus on what you're thankful for",
    content: `## Three Things I'm Grateful For Today
1. 
2. 
3. 

## One Person I'm Grateful For
*Who made a positive impact on your life recently and why?*

## One Thing That Went Well Today

## Something I'm Looking Forward To
`
  },
  problemSolving: {
    name: 'Problem Solving',
    description: 'Work through a challenge methodically',
    content: `## The Problem I'm Facing

## Why This Matters

## Possible Solutions
1. 
2. 
3. 

## Pros and Cons of Each Solution
- Solution 1:
  - Pros:
  - Cons:

- Solution 2:
  - Pros:
  - Cons:

- Solution 3:
  - Pros:
  - Cons:

## Action Plan
`
  },
  goalSetting: {
    name: 'Goal Planning',
    description: 'Set and track your goals',
    content: `## My Goal

## Why This Goal Is Important To Me

## Target Completion Date

## Key Steps To Take
1. 
2. 
3. 

## Potential Obstacles
- 

## Resources Needed
- 

## How I'll Track Progress
`
  },
  morningPages: {
    name: 'Morning Pages',
    description: 'Free-flowing morning thoughts',
    content: `*Write three pages of whatever comes to mind, without editing or censoring your thoughts. This is just for you.*

`
  }
}

export default templates
