-- ============================================
-- 游导旅游平台 - 测试数据清理SQL
-- 执行范围: test
-- 执行前请确保已备份数据！
-- ============================================

-- ============================================
-- 1. 清理测试用户账号
-- ============================================
-- 删除邮箱包含 @example.com, @demo.com, @test.com 的账号
DELETE FROM users 
WHERE email LIKE '%@demo.%' 
   OR email LIKE '%@test.%' 
   OR email LIKE '%@example.com%';

-- ============================================
-- 2. 清理演示导游档案
-- ============================================
-- 删除与演示账号关联的导游档案
DELETE FROM guide_profiles 
WHERE user_id IN (
    SELECT id FROM users 
    WHERE email IS NULL OR email = ''
)
OR user_id IN (
    'aaaa1111-1111-1111-1111-111111111111',
    'bbbb2222-2222-2222-2222-222222222222',
    'cccc3333-3333-3333-3333-333333333333',
    'dddd4444-4444-4444-4444-444444444444',
    'eeee5555-5555-5555-5555-555555555555',
    'ffff6666-6666-6666-6666-666666666666',
    'gggg7777-7777-7777-7777-777777777777',
    'hhhh8888-8888-8888-8888-888888888888',
    'iiii9999-9999-9999-9999-999999999999',
    'jjjj0000-0000-0000-0000-000000000000',
    'kkkk1111-1111-1111-1111-111111111112',
    'llll2222-2222-2222-2222-222222222223'
);

-- ============================================
-- 3. 清理演示评价
-- ============================================
DELETE FROM reviews 
WHERE guide_id IN (
    'aaaa1111-1111-1111-1111-111111111111',
    'bbbb2222-2222-2222-2222-222222222222',
    'cccc3333-3333-3333-3333-333333333333',
    'dddd4444-4444-4444-4444-444444444444',
    'eeee5555-5555-5555-5555-555555555555',
    'ffff6666-6666-6666-6666-666666666666',
    'gggg7777-7777-7777-7777-777777777777',
    'hhhh8888-8888-8888-8888-888888888888',
    'iiii9999-9999-9999-9999-999999999999',
    'jjjj0000-0000-0000-0000-000000000000'
);

-- ============================================
-- 4. 下架演示路线
-- ============================================
UPDATE routes 
SET status = 'suspended',
    updated_at = NOW()
WHERE title LIKE '%澳大利亚%新西兰%'
   OR title LIKE '%西欧五国%'
   OR title LIKE '%西班牙葡萄牙%'
   OR title LIKE '%埃及文明探索%'
   OR title LIKE '%演示%'
   OR title LIKE '%测试%';

-- ============================================
-- 5. 重置统计计数
-- ============================================
-- 重置路线报名人数
UPDATE routes SET current_enrolled = 0 WHERE status = 'draft';

-- 重置导游评价数
UPDATE guide_profiles SET reviews = 0 WHERE reviews > 1000;

-- ============================================
-- 6. 清理待处理订单
-- ============================================
UPDATE route_bookings 
SET status = 'cancelled', 
    cancel_reason = '数据清理：测试订单自动取消',
    cancelled_at = NOW(),
    updated_at = NOW()
WHERE status = 'pending'
  AND created_at < NOW() - INTERVAL '1 day';

-- ============================================
-- 7. 清理收藏记录
-- ============================================
DELETE FROM route_favorites 
WHERE user_id IS NULL 
   OR user_id NOT IN (SELECT id FROM users);

-- ============================================
-- 8. 清理浏览记录（保留匿名统计）
-- ============================================
DELETE FROM route_views 
WHERE user_id IS NOT NULL 
  AND user_id NOT IN (SELECT id FROM users);

-- ============================================
-- 9. 验证清理结果
-- ============================================
SELECT '清理后数据统计' as info;

SELECT '用户数量:' as metric, COUNT(*) as value FROM users
UNION ALL
SELECT '导游数量:', COUNT(*) FROM guide_profiles
UNION ALL
SELECT '评价数量:', COUNT(*) FROM reviews
UNION ALL
SELECT '路线数量:', COUNT(*) FROM routes WHERE status = 'published'
UNION ALL
SELECT '待处理订单:', COUNT(*) FROM route_bookings WHERE status = 'pending';

-- ============================================
-- 10. 标记清理完成
-- ============================================
-- 插入清理日志（如果存在清理日志表）
-- INSERT INTO cleanup_logs (action, executed_at, records_deleted)
-- VALUES ('test_data_cleanup', NOW(), 0);

-- ============================================
-- 清理完成
-- ============================================
-- 请检查上方的数据统计，确保符合预期
-- 如有问题，请从备份中恢复数据
