import re

from fastapi import APIRouter, HTTPException, Query
from postgrest.exceptions import APIError

from app.database import get_supabase

router = APIRouter(prefix="/api/courses", tags=["courses"])

PAGE_SIZE = 20

COURSE_COLUMNS = """
  course_id,
  department_id,
  course_identifier,
  course_prefix,
  course_title,
  course_description,
  credits,
  course_level,
  is_repeatable,
  departments(department_name)
"""

PREREQUISITE_GROUP_COLUMNS = """
  prerequisite_group_id,
  course_id,
  group_operator,
  parent_group_id,
  prerequisites(
    prerequisite_id,
    prerequisite_group_id,
    prerequisite_course_id,
    negative_prerequisite,
    min_grade,
    concurrent_allowed
  )
"""


def _database_error(error: APIError) -> HTTPException:
    return HTTPException(
        status_code=502,
        detail=error.message or "The course database request failed.",
    )


def _search_courses(columns: str, term: str):
    query = get_supabase().table("courses").select(columns, count="exact")

    if term:
        query = query.or_(
            f"course_identifier.ilike.%{term}%,course_title.ilike.%{term}%"
        )

    return query


@router.get("")
def list_courses(
    search: str = Query("", max_length=120),
    page: int = Query(0, ge=0),
):
    # Only allow ordinary search characters in PostgREST's OR expression.
    term = re.sub(r"\s+", " ", re.sub(r"[^a-zA-Z0-9 .-]", " ", search)).strip()

    try:
        try:
            response = (
                _search_courses(COURSE_COLUMNS, term)
                .order("course_identifier")
                .order("course_id")
                .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
                .execute()
            )
            courses, count = response.data or [], response.count or 0
        except APIError as error:
            # PGRST103: the requested page starts past the last matching row.
            if error.code != "PGRST103":
                raise
            response = _search_courses("course_id", term).limit(1).execute()
            courses, count = [], response.count or 0
    except APIError as error:
        raise _database_error(error) from error

    return {
        "courses": courses,
        "count": count,
        "page": page,
        "page_size": PAGE_SIZE,
    }


@router.get("/{course_identifier}")
def get_course(course_identifier: str):
    try:
        response = (
            get_supabase()
            .table("courses")
            .select(COURSE_COLUMNS)
            .eq("course_identifier", course_identifier)
            .limit(1)
            .execute()
        )
    except APIError as error:
        raise _database_error(error) from error

    if not response.data:
        raise HTTPException(status_code=404, detail="Course not found.")

    return response.data[0]


@router.get("/{course_id}/prerequisites")
def get_prerequisite_groups(course_id: int):
    supabase = get_supabase()

    try:
        groups = (
            supabase.table("prerequisite_groups")
            .select(PREREQUISITE_GROUP_COLUMNS)
            .eq("course_id", course_id)
            .order("prerequisite_group_id")
            .execute()
        ).data or []

        course_ids = sorted(
            {
                prerequisite["prerequisite_course_id"]
                for group in groups
                for prerequisite in group.get("prerequisites") or []
            }
        )

        courses = []
        if course_ids:
            courses = (
                supabase.table("courses")
                .select("course_id, course_identifier, course_title")
                .in_("course_id", course_ids)
                .execute()
            ).data or []
    except APIError as error:
        raise _database_error(error) from error

    return {
        "groups": groups,
        "prerequisiteCourses": {
            str(course["course_id"]): course for course in courses
        },
    }
