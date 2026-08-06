# Guilt-Free Budget

A single-page monthly budgeting tool. You start a month with your income, take
off what's committed, set money aside for spending categories, and whatever
remains is yours to spend without guilt.

## Language

**Salary**:
This month's expected take-home income, entered once when the month starts. The
top of the pool.
_Avoid_: Income (too broad — see Extra income), wage, pay.

**Extra income**:
One-off money that lands mid-month on top of Salary — a bonus, refund, or gift.
Positive only. It enlarges the pool, so by default it flows to Guilt-free, but
it can be set aside into a Budget like any other money.
_Avoid_: Bonus (too narrow), top-up, "overall budget".

**Fixed expense**:
A committed cost taken off the pool immediately (rent, insurance,
subscriptions). Money out, no reclaiming it.
_Avoid_: Bill, recurring cost.

**Budget**:
A named spending category with a limit, its own spend Logs, and a Settle action.
There are many; not to be confused with the whole month's pool.
_Avoid_: Category, envelope, "overall budget".

**Log**:
A single recorded spend against a Budget (amount, optional note, timestamp).
_Avoid_: Transaction, entry, expense.

**Reserved**:
Money held against a Budget: its full limit while open (or more if overspent),
shrinking to only what was actually spent once Settled.
_Avoid_: Allocated, set-aside.

**Settle**:
Closing out a Budget for the month, releasing whatever wasn't spent back into
Guilt-free. Later Logs on a settled Budget come straight out of Guilt-free.
_Avoid_: Close, finalize.

**Guilt-free**:
What's left after Fixed expenses and Reserved budget money come out of the pool:
`salary + extra income − fixed − reserved`. Derived, never stored. The money you
can spend without guilt.
_Avoid_: Remaining, disposable, leftover, surplus.
