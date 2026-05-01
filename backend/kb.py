class KnowledgeBase:
    """
    Maintains propositional logic clauses in CNF.
    Each clause is a frozenset of literals.
    A literal is a string like 'P_1_2' (pit at 1,2) or '-P_1_2' (no pit at 1,2).
    """
    def __init__(self):
        self.clauses = set()

    def tell(self, clause):
        """Add a CNF clause (frozenset of literals) to the KB."""
        self.clauses.add(frozenset(clause))

    def tell_no_hazard(self, row, col):
        """Assert that cell (row,col) has no pit and no wumpus."""
        self.tell([f'-P_{row}_{col}'])
        self.tell([f'-W_{row}_{col}'])

    def tell_breeze(self, row, col, neighbors):
        """
        Breeze at (row,col) means at least one neighbor has a pit.
        Add clause: P_n1 v P_n2 v ...
        Also add: for each neighbor n, breeze_at implies possibly pit there.
        """
        pit_clause = [f'P_{nr}_{nc}' for nr, nc in neighbors]
        if pit_clause:
            self.tell(pit_clause)

    def tell_no_breeze(self, row, col, neighbors):
        """No breeze means no adjacent pits."""
        for nr, nc in neighbors:
            self.tell([f'-P_{nr}_{nc}'])

    def tell_stench(self, row, col, neighbors):
        """Stench means at least one neighbor has wumpus."""
        wumpus_clause = [f'W_{nr}_{nc}' for nr, nc in neighbors]
        if wumpus_clause:
            self.tell(wumpus_clause)

    def tell_no_stench(self, row, col, neighbors):
        """No stench means no adjacent wumpus."""
        for nr, nc in neighbors:
            self.tell([f'-W_{nr}_{nc}'])

    def get_clauses(self):
        return [list(c) for c in self.clauses]