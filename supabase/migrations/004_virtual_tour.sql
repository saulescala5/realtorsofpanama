-- 3D / virtual tour link per listing (shown as "3D tour" on the property card and page).
alter table public.properties add column if not exists virtual_tour_url text;
update public.properties set virtual_tour_url = 'https://my.matterport.com/show/?m=7rBYBcfGsdD'
where id::text like '36815976%' and virtual_tour_url is null;
