create or replace function adjust_material_stock(target_material_id uuid, delta_quantity numeric)
returns void
language plpgsql
security definer
as $$
begin
  update materials
  set current_stock = greatest(0, current_stock + delta_quantity),
      updated_at = now()
  where id = target_material_id;
end;
$$;

create or replace view project_financial_summary as
select
  p.id as project_id,
  p.owner_id,
  coalesce(sum(pay.amount) filter (where pay.direction = 'client_in' and pay.status = 'completed' and pay.deleted_at is null), 0) as total_income,
  coalesce((select sum(e.amount) from expenses e where e.project_id = p.id and e.deleted_at is null), 0)
    + coalesce(sum(pay.amount) filter (where pay.direction = 'supplier_out' and pay.status = 'completed' and pay.deleted_at is null), 0) as total_expense,
  coalesce(sum(pay.amount) filter (where pay.direction = 'client_in' and pay.status = 'completed' and pay.deleted_at is null), 0)
    - coalesce((select sum(e.amount) from expenses e where e.project_id = p.id and e.deleted_at is null), 0)
    - coalesce(sum(pay.amount) filter (where pay.direction = 'supplier_out' and pay.status = 'completed' and pay.deleted_at is null), 0) as net_profit
from projects p
left join payments pay on pay.project_id = p.id
where p.deleted_at is null
group by p.id, p.owner_id;
