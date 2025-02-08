/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  '/api/v1/problemSet/{problemSetId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /**
     * 문항세트 수정
     * @description 문항세트의 이름 및 문항 리스트를 수정합니다.
     */
    put: operations['updateProblemSet'];
    post?: never;
    /**
     * 문항세트 삭제
     * @description 문항세트를 삭제합니다. (soft delete)
     */
    delete: operations['deleteProblemSet'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/problemSet/{problemSetId}/sequence': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /**
     * 세트 문항순서 변경
     * @description 문항세트 내의 문항 리스트의 순서를 변경합니다.
     */
    put: operations['reorderProblems'];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/problemSet/{problemSetId}/confirm': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /**
     * 문항세트 컨펌 토글
     * @description 문항세트의 컨펌 상태를 토글합니다.
     */
    put: operations['toggleConfirmProblemSet'];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/problems': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * 문항 생성
     * @description 문제를 생성합니다. 새끼 문항은 list 순서대로 sequence를 저장합니다.
     */
    post: operations['createProblem'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/problems/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 문항 조회
     * @description 문항를 조회합니다.
     */
    get: operations['getProblem'];
    put?: never;
    /**
     * 문항 업데이트
     * @description 문제를 업데이트합니다. 문항 번호, 모의고사는 수정할 수 없습니다. 새로 추가되는 새끼문항 id는 빈 값입니다.
     */
    post: operations['updateProblem'];
    /** 문항 삭제 */
    delete: operations['updateProblem_1'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/problemSet': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * 문항세트 생성
     * @description 문항세트를 생성합니다. 문항은 요청 순서대로 저장합니다.
     */
    post: operations['createProblemSet'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/auth/admin/login': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * 어드민 로그인
     * @description 아아디 패스워드 로그인 후 토큰 발급합니다.
     */
    post: operations['adminLogin'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/problems/search': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 문제 검색
     * @description 문항 ID, 문제명, 개념 태그리스트로 문제를 검색합니다. 개념 태그리스트는 OR 조건으로 검색하며 값이 없으면 쿼리파라미터에서 빼주세요
     */
    get: operations['search'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/practiceTestTags': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** 모의고사 목록 조회 */
    get: operations['getPracticeTestTags'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/member/me': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 내 정보 조회
     * @description jwt accessToken을 통해 내 정보를 조회합니다.
     */
    get: operations['getMyInfo'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/v1/conceptTags': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** 모든 개념 태그 리스트 조회 */
    get: operations['getConceptTags'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    ErrorResponse: {
      message?: string;
      /** @enum {string} */
      status?:
        | '100 CONTINUE'
        | '101 SWITCHING_PROTOCOLS'
        | '102 PROCESSING'
        | '103 EARLY_HINTS'
        | '103 CHECKPOINT'
        | '200 OK'
        | '201 CREATED'
        | '202 ACCEPTED'
        | '203 NON_AUTHORITATIVE_INFORMATION'
        | '204 NO_CONTENT'
        | '205 RESET_CONTENT'
        | '206 PARTIAL_CONTENT'
        | '207 MULTI_STATUS'
        | '208 ALREADY_REPORTED'
        | '226 IM_USED'
        | '300 MULTIPLE_CHOICES'
        | '301 MOVED_PERMANENTLY'
        | '302 FOUND'
        | '302 MOVED_TEMPORARILY'
        | '303 SEE_OTHER'
        | '304 NOT_MODIFIED'
        | '305 USE_PROXY'
        | '307 TEMPORARY_REDIRECT'
        | '308 PERMANENT_REDIRECT'
        | '400 BAD_REQUEST'
        | '401 UNAUTHORIZED'
        | '402 PAYMENT_REQUIRED'
        | '403 FORBIDDEN'
        | '404 NOT_FOUND'
        | '405 METHOD_NOT_ALLOWED'
        | '406 NOT_ACCEPTABLE'
        | '407 PROXY_AUTHENTICATION_REQUIRED'
        | '408 REQUEST_TIMEOUT'
        | '409 CONFLICT'
        | '410 GONE'
        | '411 LENGTH_REQUIRED'
        | '412 PRECONDITION_FAILED'
        | '413 PAYLOAD_TOO_LARGE'
        | '413 REQUEST_ENTITY_TOO_LARGE'
        | '414 URI_TOO_LONG'
        | '414 REQUEST_URI_TOO_LONG'
        | '415 UNSUPPORTED_MEDIA_TYPE'
        | '416 REQUESTED_RANGE_NOT_SATISFIABLE'
        | '417 EXPECTATION_FAILED'
        | '418 I_AM_A_TEAPOT'
        | '419 INSUFFICIENT_SPACE_ON_RESOURCE'
        | '420 METHOD_FAILURE'
        | '421 DESTINATION_LOCKED'
        | '422 UNPROCESSABLE_ENTITY'
        | '423 LOCKED'
        | '424 FAILED_DEPENDENCY'
        | '425 TOO_EARLY'
        | '426 UPGRADE_REQUIRED'
        | '428 PRECONDITION_REQUIRED'
        | '429 TOO_MANY_REQUESTS'
        | '431 REQUEST_HEADER_FIELDS_TOO_LARGE'
        | '451 UNAVAILABLE_FOR_LEGAL_REASONS'
        | '500 INTERNAL_SERVER_ERROR'
        | '501 NOT_IMPLEMENTED'
        | '502 BAD_GATEWAY'
        | '503 SERVICE_UNAVAILABLE'
        | '504 GATEWAY_TIMEOUT'
        | '505 HTTP_VERSION_NOT_SUPPORTED'
        | '506 VARIANT_ALSO_NEGOTIATES'
        | '507 INSUFFICIENT_STORAGE'
        | '508 LOOP_DETECTED'
        | '509 BANDWIDTH_LIMIT_EXCEEDED'
        | '510 NOT_EXTENDED'
        | '511 NETWORK_AUTHENTICATION_REQUIRED';
    };
    ProblemSetUpdateRequest: {
      problemSetName?: string;
      problems?: string[];
    };
    ProblemReorderRequest: {
      newProblems?: string[];
    };
    ChildProblemPostRequest: {
      imageUrl?: string;
      /** @enum {string} */
      problemType?: 'MULTIPLE_CHOICE' | 'SHORT_NUMBER_ANSWER' | 'SHORT_STRING_ANSWER';
      answer?: string;
      conceptTagIds?: number[];
      /** Format: int32 */
      sequence?: number;
    };
    ProblemPostRequest: {
      conceptTagIds?: number[];
      /** Format: int64 */
      practiceTestId?: number;
      /** Format: int32 */
      number?: number;
      answer?: string;
      comment?: string;
      mainProblemImageUrl?: string;
      mainAnalysisImageUrl?: string;
      readingTipImageUrl?: string;
      seniorTipImageUrl?: string;
      prescriptionImageUrl?: string;
      childProblems?: components['schemas']['ChildProblemPostRequest'][];
    };
    ChildProblemUpdateRequest: {
      /**
       * Format: int64
       * @description 새로 생성되는 새끼문항은 빈 값입니다.
       */
      id?: number;
      imageUrl?: string;
      /** @enum {string} */
      problemType?: 'MULTIPLE_CHOICE' | 'SHORT_NUMBER_ANSWER' | 'SHORT_STRING_ANSWER';
      answer?: string;
      conceptTagIds?: number[];
      /** Format: int32 */
      sequence?: number;
    };
    ProblemUpdateRequest: {
      conceptTagIds?: number[];
      /** Format: int32 */
      answer?: number;
      comment?: string;
      mainProblemImageUrl?: string;
      mainAnalysisImageUrl?: string;
      readingTipImageUrl?: string;
      seniorTipImageUrl?: string;
      prescriptionImageUrl?: string;
      updateChildProblems?: components['schemas']['ChildProblemUpdateRequest'][];
      deleteChildProblems?: number[];
    };
    ChildProblemGetResponse: {
      /** Format: int64 */
      childProblemId?: number;
      imageUrl?: string;
      /** @enum {string} */
      problemType?: 'MULTIPLE_CHOICE' | 'SHORT_NUMBER_ANSWER' | 'SHORT_STRING_ANSWER';
      answer?: string;
      conceptTagIds?: number[];
    };
    ProblemGetResponse: {
      problemId?: string;
      conceptTagIds?: number[];
      /** Format: int64 */
      practiceTestId?: number;
      /** Format: int32 */
      number?: number;
      answer?: string;
      comment?: string;
      mainProblemImageUrl?: string;
      mainAnalysisImageUrl?: string;
      readingTipImageUrl?: string;
      seniorTipImageUrl?: string;
      prescriptionImageUrl?: string;
      childProblems?: components['schemas']['ChildProblemGetResponse'][];
    };
    ProblemSetPostRequest: {
      problemSetName?: string;
      problems?: string[];
    };
    AdminLoginRequest: {
      email?: string;
      password?: string;
    };
    ConceptTagSearchResponse: {
      /** Format: int64 */
      id?: number;
      name?: string;
    };
    ProblemSearchGetResponse: {
      problemId?: string;
      comment?: string;
      mainProblemImageUrl?: string;
      conceptTagResponses?: components['schemas']['ConceptTagSearchResponse'][];
    };
    PracticeTestTagResponse: {
      /** Format: int64 */
      id?: number;
      name?: string;
    };
    MemberGetResponse: {
      /** Format: int64 */
      id?: number;
      name?: string;
      email?: string;
    };
    ConceptTagResponse: {
      /** Format: int64 */
      id?: number;
      name?: string;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  updateProblemSet: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        problemSetId: number;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ProblemSetUpdateRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Internal Server Error */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  deleteProblemSet: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        problemSetId: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Internal Server Error */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  reorderProblems: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        problemSetId: number;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ProblemReorderRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Internal Server Error */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  toggleConfirmProblemSet: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        problemSetId: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': 'CONFIRMED' | 'NOT_CONFIRMED';
        };
      };
      /** @description Internal Server Error */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  createProblem: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ProblemPostRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': string;
        };
      };
      /** @description Internal Server Error */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  getProblem: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['ProblemGetResponse'];
        };
      };
      /** @description Internal Server Error */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  updateProblem: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ProblemUpdateRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['ProblemGetResponse'];
        };
      };
      /** @description Internal Server Error */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  updateProblem_1: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['ProblemGetResponse'];
        };
      };
      /** @description Internal Server Error */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  createProblemSet: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ProblemSetPostRequest'];
      };
    };
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': number;
        };
      };
      /** @description Internal Server Error */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  adminLogin: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['AdminLoginRequest'];
      };
    };
    responses: {
      /** @description 로그인 성공 */
      200: {
        headers: {
          /** @description Access Token */
          Authorization?: string;
          /** @description Refresh Token */
          RefreshToken?: string;
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description 잘못된 요청 */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description 인증 실패 */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      /** @description Internal Server Error */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  search: {
    parameters: {
      query?: {
        problemId?: string;
        comment?: string;
        conceptTagIds?: number[];
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['ProblemSearchGetResponse'][];
        };
      };
      /** @description Internal Server Error */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  getPracticeTestTags: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['PracticeTestTagResponse'][];
        };
      };
      /** @description Internal Server Error */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  getMyInfo: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['MemberGetResponse'];
        };
      };
      /** @description Internal Server Error */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
  getConceptTags: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description OK */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['ConceptTagResponse'][];
        };
      };
      /** @description Internal Server Error */
      500: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          '*/*': components['schemas']['ErrorResponse'];
        };
      };
    };
  };
}
