-- Starter inserts omit wage, attributes, energy and form.
-- Postgres fills column defaults before the BEFORE INSERT trigger, so
-- players_fill_truth never saw null and stored wage 0, attributes 50,
-- energy 80 and form 60. Drop those defaults. The trigger already fills null.
-- Only untouched default rows are rewritten. Cash stays put.

alter table public.players
  alter column attr_attack drop default,
  alter column attr_passing drop default,
  alter column attr_defense drop default,
  alter column attr_physical drop default,
  alter column attr_goalkeeping drop default,
  alter column energy drop default,
  alter column form drop default,
  alter column wage drop default;

update public.players
set
  attr_attack = skill,
  attr_passing = skill,
  attr_defense = skill,
  attr_physical = skill,
  attr_goalkeeping = skill,
  energy = case status
    when 'INJURED' then 25
    when 'TIRED' then 42
    when 'SUSPENDED' then 50
    else least(89, greatest(70, 70 + skill / 5))
  end,
  form = least(95, greatest(20, 35 + round(skill * 0.5)::int)),
  wage = 1200 + skill * 35 + greatest(0, 32 - age) * 50
where wage = 0
  and energy = 80
  and form = 60
  and attr_attack = 50
  and attr_passing = 50
  and attr_defense = 50
  and attr_physical = 50
  and attr_goalkeeping = 50;
