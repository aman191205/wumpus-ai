def negate(literal):
    """Negate a literal."""
    if literal.startswith('-'):
        return literal[1:]
    return '-' + literal

def resolve(ci, cj):
    """
    Try to resolve two clauses.
    Returns a list of resolvents (each a frozenset), or empty list if none.
    """
    resolvents = []
    for lit in ci:
        neg = negate(lit)
        if neg in cj:
            resolvent = (ci - {lit}) | (cj - {neg})
            resolvents.append(frozenset(resolvent))
    return resolvents

def resolution_refutation(kb_clauses, query_literal):
    """
    Prove `query_literal` by refutation: add negation of query to KB,
    then resolve until we find empty clause (contradiction) or exhaust.

    Returns (proved: bool, steps: int)
    """
    # Convert KB clauses to frozensets
    clauses = set(frozenset(c) for c in kb_clauses)

    # Add negation of query as a unit clause
    neg_query = negate(query_literal)
    clauses.add(frozenset([neg_query]))

    steps = 0
    while True:
        new_clauses = set()
        clause_list = list(clauses)

        for i in range(len(clause_list)):
            for j in range(i + 1, len(clause_list)):
                resolvents = resolve(clause_list[i], clause_list[j])
                steps += 1
                for resolvent in resolvents:
                    if len(resolvent) == 0:
                        # Empty clause found — contradiction — query is proven
                        return True, steps
                    new_clauses.add(resolvent)

        if new_clauses.issubset(clauses):
            # No new clauses — cannot prove query
            return False, steps

        clauses |= new_clauses

        # Safety cap to avoid infinite loop on large KBs
        if steps > 5000:
            return False, steps