#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Execute sticker renaming"""

import os
import re
import shutil

# Base directory
BASE_DIR = "/Users/ywh/Downloads/backup_副本"

# Mapping for Chinese expressions to English
EXPRESSION_MAP = {
    # Common expressions
    "哭": "cry",
    "哭哭": "cry",
    "笑": "smile",
    "嘿嘿": "hehe",
    "嘻嘻": "hehe",
    "哈哈": "haha",
    "嗯？": "huh",
    "尴尬": "awkward",
    "好棒棒": "great",
    "让我听听": "let_me_listen",
    "一": "one",
    "倔": "stubborn",
    "干饭": "eating",
    "捏脸": "pinch_face",
    "捶桌": "slap_table",
    "被拉": "being_dragged",
    "愣住": "stunned",
    "摇滚": "rock",
    "啊啊啊": "scream",
    "没眼看": "cannot_watch",
    "摸后脑勺": "rub_head",
    "坏笑": "evil_smile",
    "社恐": "social_anxiety",
    "偷看": "peeking",
    "完了呀": "oh_no",
    "打": "hit",
    "学习": "studying",

    # Hitori
    "恐惧": "fear",
    "戳戳": "poke",
    "敲打": "tap",
    "头疼": "headache",
    "好累": "tired",
    "期待": "expect",
    "认错": "apologize",
    "不要啊": "no",
    "我看看": "let_me_see",
    "拜托了": "please",
    "不了不了": "no_thanks",
    "灵魂升天": "soul_ascend",

    # Nijika
    "嘘": "shh",
    "加油": "cheer",
    "惊呆": "shocked",
    "好孩子": "good_girl",
    "气鼓鼓": "pouting",

    # Tomori
    "哎呀": "oops",
    "开唱": "singing",
    "忧郁": "melancholy",
    "迷茫": "lost",
    "创作中": "composing",
    "不要吵架": "no_fighting",
    "我需要你": "i_need_you",
    "谢谢大家": "thank_you_all",
    "emo": "emo",
    "探头": "peek",
    "鼓掌": "applaud",
    "Y": "yes",

    # Momoka
    "起": "get_up",
    "噫": "eww",
    "略": "bleh",
    "偷瞄": "peek",
    "出现": "appear",
    "惊讶": "surprised",
    "抓狂": "freak_out",
    "拉人": "pull_someone",
    "哈？": "hah",
    "哭泣": "weep",
    "脸红": "blush",
    "睡大觉": "sleep",
    "放轻松": "relax",
    "要吐了": "gagging",

    # Subaru
    "乐": "happy",
    "组": "group",
    "？": "question",
    "嘲笑": "mock",
    "指人": "point",
    "探头": "peek",
    "狂点": "spam_click",
    "诶！": "eh",
    "龇牙": "grin",
    "吐舌": "stick_tongue",
    "收到": "received",
    "沉默": "silent",
    "献花": "offer_flowers",
    "笔芯": "finger_heart",

    # Rupa
    "队": "team",
    "冒出": "pop_out",
    "叹气": "sigh",
    "开车": "drive",
    "比耶": "peace_sign",
    "举手": "raise_hand",
    "做饭": "cooking",
    "好哎": "yay",
    "拜托": "please",
    "拜拜": "bye",
    "欣慰": "relieved",
    "比心": "heart",
    "扭屁股": "wiggle",
    "接箱子": "catch_box",
    "胸有成竹": "confident",

    # Ryo
    "COOL": "cool",
    "吃草": "eat_grass",
    "喜欢": "like",
    "憋笑": "holding_laughter",
    "投钱": "throw_money",
    "害羞": "shy",
    "跑来": "run_over",
    "喝茶": "drink_tea",
    "大吃特吃": "eating_a_lot",

    # Ikuyo
    "哇": "wow",
    "可爱": "cute",
    "微笑": "smile",
    "拍手": "clap",
    "举起手来": "raise_hands",
    "害怕": "scared",
    "感动": "moved",
    "疑问": "question",
    "星星眼": "star_eyes",
    "等一下": "wait",
    "怎么办": "what_to_do",
    "失去颜色": "lose_color",

    # Taki
    "Block!": "block",
    "再见": "goodbye",
    "瞪": "glare",
    "傲娇": "tsundere",
    "逃跑": "run_away",
    "啧": "tsk",
    "不是的": "no",
    "请点单": "please_order",
    "突然出现": "suddenly_appear",
    "那我呢？": "what_about_me",
    "G": "guitar",

    # Tomo
    "乐": "happy",
    "啊": "ah",
    "额": "uh",
    "呆住": "frozen",
    "流汗": "sweat",
    "震惊": "shocked",
    "不行": "no",
    "哼！": "humph",
    "泪目": "teary_eyed",
    "郁闷": "depressed",
    "你干嘛": "what_are_you_doing",
    "箱子头": "box_head",
    "吨吨吨": "drinking",
    "咬牙切齿": "gnashing_teeth",
    "太差劲了": "too_bad",
    "让我看看": "let_me_see",

    # Nyamu
    "感动大哭": "moved_to_tears",
    "嘻嘻喵": "happy_meow",
    "拜托了喵": "please_meow",
    "晚上好喵": "good_evening_meow",
    "哦": "oh",
    "再见": "goodbye",
    "张望": "look_around",
    "坏坏": "naughty",
    "委屈": "aggrieved",
    "赌气": "sulking",
    "难道说": "could_it_be",
    "加个好友": "add_friend",
    "记得微笑": "remember_to_smile",

    # Mutsumi
    "捂嘴笑": "covering_mouth_smile",
    "撒娇": "act_cute",
    "喝饮料": "drink_beverage",
    "浇黄瓜": "water_cucumber",
    "wink": "wink",
    "哼": "humph",
    "诶": "eh",
    "生气": "angry",
    "唱歌": "singing",
    "开心": "happy",
    "抱抱": "hug",
    "雨天": "rainy_day",
    "叫我吗": "calling_me",
    "怎么突然": "why_suddenly",
    "是秘密哦": "its_a_secret",

    # Sakiko
    "cool": "cool",
    "打call": "cheer",
    "退勤": "clock_out",
    "神降临": "god_descent",
    "伸手": "reach_out",
    "鼓掌": "applaud",
    "呐喊": "shout",
    "小祥": "sachiko",
    "愉快": "pleased",
    "撩发": "toss_hair",
    "美味": "delicious",
    "不可以": "no",
    "我有话说": "i_have_something_to_say",

    # Soyo
    "玩头发": "play_with_hair",
    "剪切": "cut",
    "微笑": "smile",
    "生气": "angry",
    "大哭": "cry_loudly",
    "服了": "giving_up",
    "注视": "stare",
    "认真": "serious",
    "想到了": "thought_of_something",
    "为什么！": "why",
    "发送消息": "send_message",
    "O": "surprised",

    # Anon
    "Love": "love",
    "SNS见": "see_you_on_sns",
    "TGW": "tgw",
    "泣": "cry",
    "哈？": "hah",
    "比心": "heart",
    "哈？！": "hah",
    "不会吧？": "really",
    "抢到票啦": "got_tickets",
    "爱音东京": "tokino_anon_tokyo",
    "!": "shocked",

    # GBC
    "什么": "what",
    "环抱": "embrace",
    "拍照": "take_photo",
    "疑惑": "confused",

    # KB
    "威胁": "threaten",
    "摸头": "pat_head",
    "贴贴": "snuggle",
    "大吃特吃": "eating_a_lot",
    "醒一醒": "wake_up",
    "三脸尴尬": "awkward_triple",

    # Mana
    "五冠王": "five_time_champion",
    "伸懒腰": "stretch",
    "分你一半": "share_with_you",

    # Raana
    "握手": "handshake",
    "rua猫": "pet_cat",
    "思考": "thinking",
    "观察": "observe",
    "刚睡醒": "just_woke_up",
    "发现猎物": "found_prey",
    "喜欢抹茶": "likes_matcha",
    "抹茶芭菲": "matcha_parfait",
    "捕猎状态": "hunting_mode",
    "溜了溜了": "running_away",
    "被猫环绕": "surrounded_by_cats",
    "有趣的女人": "interesting_woman",
    "M": "thinking",

    # Uika
    "咋舌": "click_tongue",
    "实现了": "achieved",
    "摘面具": "take_off_mask",
    "淋湿了": "got_wet",
    "挺好": "pretty_good",
    "没收": "confiscated",
    "点赞": "like",
    "摘墨镜": "take_off_sunglasses",
    "接电话": "answer_phone",
    "比叉叉": "cross_fingers",
    "喜极而泣": "tears_of_joy",
    "领域展开": "domain_expansion",
    "再等一下": "wait_a_bit_more",

    # Umiri
    "想要信赖": "want_to_trust",
    "干得好": "good_job",
    "再吃一个": "eat_one_more",
    "憋不住了": "cant_hold_it",
    "摇摇": "shake",
    "豪饮": "chug",
    "哟豁": "yo",
    "开门": "open_door",
    "恭敬": "respectful",
    "睡觉": "sleep",
    "难道？": "really",
    "帅气抹脸": "cool_face_wipe",
    "一次买够": "buy_all_at_once",
    "我要告你": "ill_report_you",
    "真谄媚啊": "so_sycophantic",
}

# Clean up expression names from brackets and special characters
def clean_expression(expr):
    # Remove brackets like [孤独摇滚!_xxx] or [良辰共此曲动态表情包_xxx]
    expr = re.sub(r'\[孤独摇滚!_', '', expr)
    expr = re.sub(r'\[夜奏未终·动态表情包_', '', expr)
    expr = re.sub(r'\[良辰共此曲·动态表情包_', '', expr)
    expr = re.sub(r'\[夜奏未终动态表情包_', '', expr)
    expr = re.sub(r'\[良辰共此曲动态表情包_', '', expr)
    expr = re.sub(r'\]', '', expr)
    expr = expr.strip()

    # Handle special cases
    if expr == "!":
        return "!"
    if expr == "O":
        return "O"
    if expr == "M":
        return "M"
    if expr == "G":
        return "G"
    if expr == "Y":
        return "Y"

    return expr

def get_english_expression(expr):
    # First clean the expression
    expr = clean_expression(expr)

    # Direct lookup
    if expr in EXPRESSION_MAP:
        return EXPRESSION_MAP[expr]

    # Try without trailing punctuation
    if expr.endswith("？") or expr.endswith("!") or expr.endswith("。"):
        base = expr[:-1]
        if base in EXPRESSION_MAP:
            return EXPRESSION_MAP[base]

    # Return the cleaned expression if no translation found
    return expr.replace(" ", "_").replace("？", "").replace("！", "").replace("。", "")

def generate_and_execute_renaming():
    renamed_count = 0
    skip_count = 0
    error_count = 0
    errors = []

    for dir_name in os.listdir(BASE_DIR):
        dir_path = os.path.join(BASE_DIR, dir_name)

        if not os.path.isdir(dir_path):
            continue

        for file_name in os.listdir(dir_path):
            if file_name.startswith('.'):
                continue

            # Get extension
            ext = os.path.splitext(file_name)[1]
            if ext.lower() not in ['.png', '.gif', '.webp']:
                continue

            # Get expression name (without extension)
            expr = os.path.splitext(file_name)[0]

            # Get English translation
            english_expr = get_english_expression(expr)

            # Create new filename
            new_name = f"{dir_name.lower()}_{english_expr.lower()}{ext}"

            # Skip if already renamed
            if file_name == new_name:
                skip_count += 1
                continue

            old_path = os.path.join(BASE_DIR, dir_name, file_name)
            new_path = os.path.join(BASE_DIR, dir_name, new_name)

            # Handle conflicts
            if os.path.exists(new_path):
                print(f"CONFLICT: {new_name} already exists, skipping: {file_name}")
                error_count += 1
                continue

            # Rename the file
            try:
                shutil.move(old_path, new_path)
                print(f"Renamed: {file_name} -> {new_name}")
                renamed_count += 1
            except Exception as e:
                print(f"ERROR: Could not rename {file_name}: {e}")
                error_count += 1
                errors.append((file_name, str(e)))

    print(f"\n{'='*60}")
    print(f"Renaming complete!")
    print(f"  Renamed: {renamed_count} files")
    print(f"  Skipped: {skip_count} files")
    print(f"  Errors: {error_count}")
    print(f"{'='*60}")

    if errors:
        print("\nErrors encountered:")
        for file_name, error in errors:
            print(f"  {file_name}: {error}")

    return renamed_count, skip_count, error_count

if __name__ == "__main__":
    generate_and_execute_renaming()
