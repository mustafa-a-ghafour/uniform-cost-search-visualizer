# Extract Minimum Cost Node
def ExtractMin(FRONTIER):

    FRONTIER.sort()

    return FRONTIER.pop(0)


# Build Path Function
def BuildPath(PARENT, u):

    PATH = []

    while u is not None:
        PATH.append(u)
        u = PARENT[u]

    PATH.reverse()

    return PATH


# Uniform Cost Search
def uniform_cost_search(s, goal):

    FRONTIER = [(0, s)]
    EXPLORED = set()
    COST = {s: 0}
    PARENT = {s: None}

    while FRONTIER:

        current_cost, u = ExtractMin(FRONTIER)

        if u == goal:
            return BuildPath(PARENT, u), COST[u]

        EXPLORED.add(u)

        for v, edge_cost in graph[u]:

            if v in EXPLORED:
                continue

            new_cost = COST[u] + edge_cost

            if v not in COST or new_cost < COST[v]:

                COST[v] = new_cost
                PARENT[v] = u

                found = False

                for i in range(len(FRONTIER)):

                    if FRONTIER[i][1] == v:

                        FRONTIER[i] = (new_cost, v)
                        found = True
                        break

                if not found:
                    FRONTIER.append((new_cost, v))

    return [], float('inf')


# Graph
graph = {
    'S': [('A', 40), ('B', 70)],
    'A': [('C', 60), ('D', 100)],
    'B': [('D', 30), ('E', 80)],
    'C': [('F', 40)],
    'D': [('E', 20), ('G', 90)],
    'E': [('G', 60)],
    'F': [('G', 30)],
    'G': []
}


# Run Algorithm
PATH, total_cost = uniform_cost_search('S', 'G')

print("Path:", PATH)
print("Total Cost:", total_cost)