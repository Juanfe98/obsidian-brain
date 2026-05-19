| Pattern   | Classes                                                             |
| --------- | ------------------------------------------------------------------- |
| Container | mx-auto max-w-6xl p-6                                               |
| Card      | rounded-lg border bg-white p-4 shadow-sm                            |
| Row       | flex items-center gap-3                                             |
| Between   | flex items-center justify-between                                   |
| Grid      | grid gap-4 sm:grid-cols-2 lg:grid-cols-3                            |
| Button    | rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700       |
| Input     | w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500 |
| Table     | w-full border-collapse text-sm                                      |
| Cell      | border-b px-4 py-3                                                  |
| Badge     | rounded-full px-2 py-1 text-xs                                      |

| Use case         | Tailwind classes                                                                       | What it does                                |
| ---------------- | -------------------------------------------------------------------------------------- | ------------------------------------------- |
| Page wrapper     | min-h-screen bg-gray-50 p-6                                                            | Full page height, light background, spacing |
| Center content   | mx-auto max-w-6xl                                                                      | Centers content with max width              |
| Card             | rounded-lg border bg-white p-4 shadow-sm                                               | Clean container/card                        |
| Flex row         | flex items-center gap-3                                                                | Horizontal alignment with spacing           |
| Space between    | flex items-center justify-between                                                      | Items on opposite sides                     |
| Grid cards       | grid gap-4 sm:grid-cols-2 lg:grid-cols-3                                               | Responsive card grid                        |
| Heading          | text-2xl font-semibold text-gray-900                                                   | Main title                                  |
| Subtitle         | text-sm text-gray-500                                                                  | Secondary text                              |
| Button primary   | rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700                          | Main button                                 |
| Button secondary | rounded-md border px-4 py-2 text-gray-700 hover:bg-gray-50                             | Secondary button                            |
| Disabled button  | disabled:cursor-not-allowed disabled:opacity-50                                        | Disabled UI behavior                        |
| Input            | w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 | Basic input                                 |
| Select           | w-full rounded-md border bg-white px-3 py-2                                            | Basic select                                |
| Label            | mb-1 block text-sm font-medium text-gray-700                                           | Form label                                  |
| Error text       | text-sm text-red-600                                                                   | Error message                               |
| Table            | w-full border-collapse text-sm                                                         | Full-width table                            |
| Table header     | bg-gray-100 text-left text-gray-700                                                    | Header background                           |
| Table cell       | border-b px-4 py-3                                                                     | Cell spacing and separator                  |
| Badge green      | rounded-full bg-green-100 px-2 py-1 text-xs text-green-700                             | Success badge                               |
| Badge yellow     | rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-700                           | Warning badge                               |
| Badge red        | rounded-full bg-red-100 px-2 py-1 text-xs text-red-700                                 | Error badge                                 |
| Loading skeleton | animate-pulse rounded bg-gray-200                                                      | Placeholder loading state                   |
| Empty state      | rounded-lg border border-dashed p-8 text-center text-gray-500                          | Empty UI container                          |
