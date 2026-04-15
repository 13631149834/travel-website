#!/bin/bash
#===============================================
# 游导旅游网站 - 自动化部署脚本
# 作者: YouDao Travel
# 用途: 自动检测变更、提交到GitHub、触发Vercel部署
#===============================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
REPO_URL="https://github.com/13631149834/travel-website.git"
WEBSITE_URL="https://youdao-travel.com"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$PROJECT_DIR/监督日志/deploy-$(date +%Y%m%d-%H%M%S).log"

#===============================================
# 日志函数
#===============================================
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $1" >> "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [SUCCESS] $1" >> "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARNING] $1" >> "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $1" >> "$LOG_FILE"
}

#===============================================
# 检测文件变更
#===============================================
detect_changes() {
    log_info "正在检测文件变更..."
    
    cd "$PROJECT_DIR"
    
    # 检查git状态
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_warning "不是Git仓库，正在初始化..."
        git init
        git remote add origin "$REPO_URL"
    fi
    
    # 获取远程分支信息
    git fetch origin main 2>/dev/null || git fetch origin master 2>/dev/null
    
    # 检查是否有未提交的变更
    if git diff --stat HEAD 2>/dev/null | grep -q "files changed"; then
        log_info "发现未提交的变更"
        return 0
    fi
    
    # 检查与远程的差异
    BRANCH=$(git rev-parse --abbrev-ref HEAD)
    if git diff "origin/$BRANCH" --stat 2>/dev/null | grep -q "files changed"; then
        log_info "发现需要推送的变更"
        return 0
    fi
    
    log_info "未检测到文件变更"
    return 1
}

#===============================================
# 自动提交到GitHub
#===============================================
auto_commit() {
    log_info "开始自动提交流程..."
    
    cd "$PROJECT_DIR"
    
    # 配置Git用户（可自定义）
    git config user.email "deploy@youdao-travel.com" 2>/dev/null || true
    git config user.name "YouDao Auto Deploy" 2>/dev/null || true
    
    # 添加所有变更（排除敏感文件）
    log_info "正在暂存文件..."
    git add -A
    
    # 排除不需要提交的文件
    git reset --quiet HEAD -- \
        "*.log" \
        "*.tar.gz" \
        "node_modules/" \
        ".DS_Store" \
        "Thumbs.db" \
        2>/dev/null || true
    
    # 检查是否有内容需要提交
    if git diff --cached --quiet; then
        log_info "没有需要提交的内容"
        return 1
    fi
    
    # 生成提交信息
    COMMIT_MSG="Auto-deploy: $(date '+%Y-%m-%d %H:%M:%S')
    
🤖 自动部署更新
- 检测到文件变更
- 触发自动提交
- 来源: YouDao Travel Deploy Script"
    
    # 提交变更
    log_info "正在提交变更..."
    if git commit -m "$COMMIT_MSG"; then
        log_success "变更已提交"
        return 0
    else
        log_error "提交失败"
        return 1
    fi
}

#===============================================
# 推送到GitHub
#===============================================
push_to_github() {
    log_info "正在推送到GitHub..."
    
    cd "$PROJECT_DIR"
    BRANCH=$(git rev-parse --abbrev-ref HEAD)
    
    # 添加远程仓库（如果不存在）
    if ! git remote -v | grep -q "origin"; then
        git remote add origin "$REPO_URL" 2>/dev/null || \
        git remote set-url origin "$REPO_URL"
    fi
    
    # 设置GitHub Token（如果环境变量存在）
    if [ -n "$GITHUB_TOKEN" ]; then
        # 使用Token认证
        git remote set-url origin "https://x-access-token:${GITHUB_TOKEN}@github.com/13631149834/travel-website.git"
    fi
    
    # 推送分支
    if git push -u origin "$BRANCH" --force 2>&1; then
        log_success "已成功推送到GitHub"
        return 0
    else
        log_error "推送失败，可能需要认证"
        return 1
    fi
}

#===============================================
# 触发Vercel部署
#===============================================
trigger_vercel_deploy() {
    log_info "正在触发Vercel部署..."
    
    # 使用Vercel API触发部署
    if [ -n "$VERCEL_TOKEN" ]; then
        RESPONSE=$(curl -s -X POST \
            "https://api.vercel.com/v13/deployments" \
            -H "Authorization: Bearer $VERCEL_TOKEN" \
            -H "Content-Type: application/json" \
            -d '{
                "gitSource": {
                    "type": "github",
                    "repo": "13631149834/travel-website",
                    "ref": "main"
                }
            }')
        
        if echo "$RESPONSE" | grep -q '"id"'; then
            DEPLOY_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
            log_success "Vercel部署已触发: $DEPLOY_ID"
            return 0
        else
            log_warning "Vercel API响应异常: $RESPONSE"
        fi
    else
        log_info "未配置VERCEL_TOKEN，将在GitHub Actions中完成部署"
    fi
    
    return 0
}

#===============================================
# 验证网站状态
#===============================================
verify_website() {
    log_info "正在验证网站状态..."
    
    # 等待一段时间让部署完成
    sleep 30
    
    # 检查网站可访问性
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "$WEBSITE_URL" 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" = "200" ]; then
        log_success "网站验证通过 (HTTP $HTTP_CODE)"
        return 0
    elif [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
        log_success "网站可访问 (HTTP $HTTP_CODE - 重定向正常)"
        return 0
    else
        log_warning "网站响应异常 (HTTP $HTTP_CODE)"
        return 1
    fi
}

#===============================================
# 发送通知（可选）
#===============================================
send_notification() {
    local status=$1
    local message=$2
    
    # Webhook通知（支持飞书、钉钉等）
    if [ -n "$WEBHOOK_URL" ]; then
        curl -s -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"msgtype\": \"text\", \"text\": {\"content\": \"[游导旅游] $status: $message\"}}" \
            > /dev/null 2>&1 || true
    fi
}

#===============================================
# 主流程
#===============================================
main() {
    echo "=============================================="
    echo "      游导旅游网站 - 自动化部署脚本"
    echo "      $(date '+%Y-%m-%d %H:%M:%S')"
    echo "=============================================="
    
    # 确保日志目录存在
    mkdir -p "$PROJECT_DIR/监督日志"
    
    log_info "===== 开始部署流程 ====="
    
    # 检测变更
    if ! detect_changes; then
        log_info "没有变更需要部署，退出"
        exit 0
    fi
    
    # 自动提交
    if ! auto_commit; then
        log_error "提交失败，终止部署"
        exit 1
    fi
    
    # 推送到GitHub
    if ! push_to_github; then
        log_error "推送失败，请检查认证配置"
        send_notification "失败" "GitHub推送失败"
        exit 1
    fi
    
    # 触发Vercel部署
    trigger_vercel_deploy
    
    # 验证网站状态
    if verify_website; then
        log_success "===== 部署完成 ====="
        send_notification "成功" "网站部署成功"
    else
        log_warning "网站验证未通过，请检查"
        send_notification "警告" "网站验证未通过"
    fi
    
    log_info "日志文件: $LOG_FILE"
}

#===============================================
# 快速部署模式（仅推送）
#===============================================
quick_deploy() {
    echo "快速部署模式 - 仅推送当前代码"
    cd "$PROJECT_DIR"
    
    git add -A
    git commit -m "Quick deploy: $(date '+%Y-%m-%d %H:%M:%S')" || exit 0
    push_to_github
    
    log_success "快速部署完成"
}

#===============================================
# 使用说明
#===============================================
show_usage() {
    echo "游导旅游网站自动化部署脚本"
    echo ""
    echo "用法:"
    echo "  $0              运行完整部署流程"
    echo "  $0 quick        快速部署模式"
    echo "  $0 check        仅检测变更"
    echo "  $0 help         显示帮助信息"
    echo ""
    echo "环境变量:"
    echo "  GITHUB_TOKEN    GitHub访问令牌"
    echo "  VERCEL_TOKEN    Vercel API令牌"
    echo "  WEBHOOK_URL     通知Webhook地址"
    echo ""
}

# 根据参数执行不同操作
case "${1:-}" in
    quick)
        quick_deploy
        ;;
    check)
        detect_changes
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        main
        ;;
esac
