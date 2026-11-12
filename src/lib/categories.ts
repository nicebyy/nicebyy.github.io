import { PostMeta } from "./posts";

export interface CategoryNode {
  name: string;        // 표시 명칭 (예: "Backend", "Spring")
  fullPath: string;    // 전체 식별 경로 (예: "Backend", "Backend/Spring")
  count: number;       // 해당 카테고리 및 하위 포함 글 수
  directCount: number; // 정확히 해당 경로에 속한 글 수
  children: CategoryNode[];
}

/**
 * 포스트 목록을 분석하여 계층형 카테고리 트리 구조를 생성합니다.
 * 지원 형식: "Backend/Spring", "Infra/DB", "Architecture" 등
 */
export function buildCategoryTree(posts: PostMeta[]): CategoryNode[] {
  const rootMap = new Map<string, CategoryNode>();

  for (const post of posts) {
    const rawCat = post.category ? post.category.trim() : "Uncategorized";
    const parts = rawCat.split("/").map((p) => p.trim()).filter(Boolean);

    if (parts.length === 0) continue;

    const topName = parts[0];
    let topNode = rootMap.get(topName);
    if (!topNode) {
      topNode = {
        name: topName,
        fullPath: topName,
        count: 0,
        directCount: 0,
        children: [],
      };
      rootMap.set(topName, topNode);
    }
    topNode.count++;

    if (parts.length === 1) {
      topNode.directCount++;
    } else {
      // 서브 카테고리 (2단계)
      const subName = parts.slice(1).join("/");
      const fullSubPath = `${topName}/${subName}`;
      let subNode = topNode.children.find((c) => c.fullPath === fullSubPath);
      if (!subNode) {
        subNode = {
          name: subName,
          fullPath: fullSubPath,
          count: 0,
          directCount: 0,
          children: [],
        };
        topNode.children.push(subNode);
      }
      subNode.count++;
      subNode.directCount++;
    }
  }

  // 자식 노드 정렬 (글 많은 순 또는 이름순)
  const roots = Array.from(rootMap.values()).sort((a, b) => b.count - a.count);
  for (const root of roots) {
    root.children.sort((a, b) => b.count - a.count);
  }

  return roots;
}

/**
 * 카테고리 일치 여부 확인 (계층형 지원)
 * - filter === "ALL": 모든 글 일치
 * - filter === "Backend": "Backend", "Backend/Spring", "Backend/JPA" 모두 일치
 * - filter === "Backend/Spring": "Backend/Spring"만 일치
 */
export function matchesCategoryPath(postCategory: string, filterCategory: string): boolean {
  if (!filterCategory || filterCategory === "ALL") return true;
  if (!postCategory) return false;
  return postCategory === filterCategory || postCategory.startsWith(filterCategory + "/");
}
