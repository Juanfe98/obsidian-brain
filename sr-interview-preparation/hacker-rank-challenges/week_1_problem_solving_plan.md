# Week 1 Plan — Problem-Solving Foundation

## Main Goal

Build the habit of solving coding challenges with structure instead of jumping directly into code.

This week is not about solving hard problems. It is about learning how to:

- Understand the problem clearly
- Create examples manually
- Find the brute-force approach
- Code a simple solution
- Test edge cases
- Explain time and space complexity

Recommended time: **45–60 minutes per day**

---

# Daily Problem-Solving Template

Use this template for every exercise.

```txt
1. Restate the problem in my own words
2. Identify input and output
3. Write at least 2 examples manually
4. Think of the brute-force solution first
5. Code the brute-force solution
6. Test edge cases
7. Analyze time and space complexity
8. Write the pattern learned
```

---

# Day 1 — Reverse a String

## Problem Description

Given a string `s`, return a new string with the characters in reverse order.

You must not use the built-in `reverse()` method for the main solution.

## Function Description

Complete the function `reverseString`.

```ts
function reverseString(s: string): string
```

## Parameters

- `s`: a string containing lowercase and/or uppercase English letters

## Return

- A string representing `s` reversed

## Example 1

```txt
Input:
s = "hello"

Output:
"olleh"
```

## Example 2

```txt
Input:
s = "React"

Output:
"tcaeR"
```

## Constraints

```txt
0 <= s.length <= 10^5
```

## Edge Cases to Consider

```txt
s = ""
s = "a"
s = "aa"
s = "ab"
```

## Expected Learning

You should practice:

- Iterating from the end of a string
- Building a result step by step
- Understanding O(n) time complexity

## Pattern

```txt
Basic iteration
```

---

# Day 2 — Count Characters in a String

## Problem Description

Given a string `s`, return an object or map containing the number of times each character appears.

## Function Description

Complete the function `countCharacters`.

```ts
function countCharacters(s: string): Map<string, number>
```

## Parameters

- `s`: a string containing lowercase English letters

## Return

- A `Map` where each key is a character and each value is the number of occurrences

## Example 1

```txt
Input:
s = "hello"

Output:
{
  h: 1,
  e: 1,
  l: 2,
  o: 1
}
```

## Example 2

```txt
Input:
s = "aabbccc"

Output:
{
  a: 2,
  b: 2,
  c: 3
}
```

## Constraints

```txt
0 <= s.length <= 10^5
```

## Edge Cases to Consider

```txt
s = ""
s = "a"
s = "aaaa"
s = "abc"
```

## Expected Learning

You should practice:

- Using `Map`
- Checking whether a key already exists
- Updating counts safely

## Useful Pattern

```ts
const map = new Map<string, number>();

for (const char of s) {
  map.set(char, (map.get(char) ?? 0) + 1);
}
```

## Pattern

```txt
Frequency map
```

---

# Day 3 — Find the Maximum Number in an Array

## Problem Description

Given an array of integers `nums`, return the largest number in the array.

You must not use `Math.max(...nums)` for the main solution.

## Function Description

Complete the function `findMax`.

```ts
function findMax(nums: number[]): number | null
```

## Parameters

- `nums`: an array of integers

## Return

- The largest number in the array
- Return `null` if the array is empty

## Example 1

```txt
Input:
nums = [1, 5, 3, 9, 2]

Output:
9
```

## Example 2

```txt
Input:
nums = [-10, -3, -20]

Output:
-3
```

## Constraints

```txt
0 <= nums.length <= 10^5
-10^9 <= nums[i] <= 10^9
```

## Edge Cases to Consider

```txt
nums = []
nums = [1]
nums = [-1, -2, -3]
nums = [5, 5, 5]
```

## Expected Learning

You should practice:

- Initializing values safely
- Handling empty input
- Comparing values while iterating

## Pattern

```txt
Linear scan
```

---

# Day 4 — Check if a String Is a Palindrome

## Problem Description

Given a string `s`, determine whether it is a palindrome.

A palindrome is a string that reads the same forward and backward.

For this exercise, assume the string only contains lowercase English letters.

## Function Description

Complete the function `isPalindrome`.

```ts
function isPalindrome(s: string): boolean
```

## Parameters

- `s`: a string containing lowercase English letters

## Return

- `true` if `s` is a palindrome
- `false` otherwise

## Example 1

```txt
Input:
s = "madam"

Output:
true
```

## Example 2

```txt
Input:
s = "hello"

Output:
false
```

## Example 3

```txt
Input:
s = "racecar"

Output:
true
```

## Constraints

```txt
0 <= s.length <= 10^5
```

## Edge Cases to Consider

```txt
s = ""
s = "a"
s = "aa"
s = "ab"
```

## Expected Learning

You should practice:

- Comparing characters from both ends
- Moving two pointers
- Avoiding unnecessary string creation

## Pattern

```txt
Two pointers
```

## Suggested Approach

```txt
left starts at 0
right starts at s.length - 1

while left < right:
  compare s[left] and s[right]
  if different, return false
  move left forward
  move right backward

return true
```

---

# Day 5 — Find the Extra Character

## Problem Description

You are given two strings `s` and `t`.

String `t` is generated by taking string `s`, adding one extra character at a random position, and possibly shuffling the result.

Return the extra character.

## Function Description

Complete the function `findExtraCharacter`.

```ts
function findExtraCharacter(s: string, t: string): string
```

## Parameters

- `s`: the original string
- `t`: the modified string containing exactly one extra character

## Return

- The extra character in `t`

## Example 1

```txt
Input:
s = "abcd"
t = "abcde"

Output:
"e"
```

## Example 2

```txt
Input:
s = ""
t = "y"

Output:
"y"
```

## Example 3

```txt
Input:
s = "aabb"
t = "ababc"

Output:
"c"
```

## Constraints

```txt
0 <= s.length <= 10^5
t.length === s.length + 1
s and t contain lowercase English letters
```

## Edge Cases to Consider

```txt
s = ""
t = "a"

s = "a"
t = "aa"

s = "abc"
t = "abcc"
```

## Expected Learning

You should practice:

- Comparing two strings with frequency maps
- Handling duplicate characters
- Understanding why simple `includes` is not always enough

## Pattern

```txt
Frequency map
```

---

# Day 6 — Remove One Character to Match Target

## Problem Description

You are given two strings, `str1` and `str2`.

`str1` contains exactly one character more than `str2`.

Find all indices in `str1` where removing that character makes `str1` equal to `str2`.

Return the indices in increasing order.

If no such index exists, return `[-1]`.

Use 0-based indexing.

## Function Description

Complete the function `getRemovableIndices`.

```ts
function getRemovableIndices(str1: string, str2: string): number[]
```

## Parameters

- `str1`: the string to modify
- `str2`: the target string

## Return

- An array of indices that can be removed from `str1`
- Return `[-1]` if no valid index exists

## Example 1

```txt
Input:
str1 = "abdgggda"
str2 = "abdggda"

Output:
[3, 4, 5]
```

## Explanation

Removing the character at index `3`, `4`, or `5` produces `"abdggda"`.

## Example 2

```txt
Input:
str1 = "aabc"
str2 = "abc"

Output:
[0, 1]
```

## Example 3

```txt
Input:
str1 = "abc"
str2 = "def"

Output:
[-1]
```

## Constraints

```txt
1 <= str1.length <= 10^5
str2.length === str1.length - 1
```

## Edge Cases to Consider

```txt
str1 = "abc"
str2 = "ab"
Expected: [2]

str1 = "abc"
str2 = "bc"
Expected: [0]

str1 = "aaa"
str2 = "aa"
Expected: [0, 1, 2]
```

## Expected Learning

You should practice:

- Starting with brute force
- Simulating removal
- Handling repeated removable characters
- Thinking about optimization after correctness

## Brute-Force Pattern

```txt
For every index:
  remove that character
  compare result with target
```

## Pattern

```txt
Try each index
```

---

# Day 7 — Review Day

Do not start a brand-new difficult problem today.

Use this day to review the exercises from Day 1 to Day 6.

## Tasks

```txt
1. Re-solve Day 1 without looking at your previous code
2. Re-solve Day 2 without looking at your previous code
3. Re-solve Day 4 using two pointers
4. Re-solve Day 6 using brute force
5. Write down the patterns you learned
```

## Patterns to Review

```txt
Basic iteration
Frequency map
Linear scan
Two pointers
Try each index
```

## Reflection Questions

Answer these in writing:

```txt
1. Which problem felt easiest?
2. Which problem felt hardest?
3. What clue in the problem helped identify the pattern?
4. Did I start with brute force?
5. Did I test edge cases?
6. Can I explain my solution out loud?
```

---

# How to Measure Progress This Week

You are doing well if by the end of the week you can:

```txt
- Read a problem without panicking
- Explain the input and output
- Write at least two examples manually
- Create a brute-force solution
- Identify basic patterns like Map, two pointers, and linear scan
- Explain time and space complexity in simple terms
```

You are not expected to solve everything optimally yet.

The main win is building a repeatable process.

---

# Recommended Daily Format

```txt
10 min — Read and restate the problem
10 min — Manual examples and edge cases
20 min — Code brute-force solution
10 min — Test and debug
10 min — Complexity + pattern notes
```

---

# Personal Pattern Notes

Use this section after each exercise.

## Problem Name

```txt
Pattern:
What clue triggered the pattern:
Brute-force idea:
Optimized idea:
Mistake I made:
How I would solve it next time:
```

---

# Week 1 Summary

This week is about foundation.

Do not judge yourself by speed.

Judge yourself by process:

```txt
Did I understand the problem?
Did I write examples?
Did I find brute force?
Did I test edge cases?
Did I learn a pattern?
```

That is how you get better.
