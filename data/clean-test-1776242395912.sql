-- ============================================
-- 测试数据清理脚本
-- 执行范围: test
-- ============================================

-- 1. 清理测试用户账号
DELETE FROM users 
WHERE email LIKE '%@demo.%' 
   OR email LIKE '%@test.%' 
   OR email LIKE '%@example.%';

-- 2. 清理演示导游
DELETE FROM guide_profiles 
WHERE user_id IN (
    SELECT id FROM users 
    WHERE email LIKE '%@example.com%'
);

-- 3. 清理演示评价
DELETE FROM reviews 
WHERE guide_id IN (
    SELECT user_id FROM guide_profiles 
    WHERE user_id LIKE '%1111%' 
       OR user_id LIKE '%2222%'
);

-- 4. 清理演示路线
DELETE FROM routes 
WHERE title LIKE '%演示%' 
   OR title LIKE '%测试%';

-- 5. 重置统计计数
UPDATE routes SET current_enrolled = 0;
UPDATE guide_profiles SET reviews = 0;

-- 6. 清理待处理订单
UPDATE route_bookings 
SET status = 'cancelled', 
    cancel_reason = '数据清理取消'
WHERE status = 'pending';

-- 7. 清理收藏记录
DELETE FROM route_favorites 
WHERE user_id NOT IN (SELECT id FROM users);

-- 8. 清理浏览记录
DELETE FROM route_views 
WHERE user_id IS NOT NULL 
  AND user_id NOT IN (SELECT id FROM users);

-- 9. 验证清理结果
SELECT 'Users after cleanup:' as info, COUNT(*) as count FROM users;
SELECT 'Guides after cleanup:' as info, COUNT(*) as count FROM guide_profiles;
SELECT 'Reviews after cleanup:' as info, COUNT(*) as count FROM reviews;
SELECT 'Routes after cleanup:' as info, COUNT(*) as count FROM routes;
