import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as decisionsService from "../services/decisions";

export function useDecisionsByProject(projectId?: number) {
  return useQuery({
    queryKey: ["decisions", projectId],
    queryFn: () => decisionsService.getDecisionsByProject(projectId!),
    enabled: !!projectId,
  });
}

export function useDecision(decisionId?: number) {
  return useQuery({
    queryKey: ["decision", decisionId],
    queryFn: () => decisionsService.getDecisionById(decisionId!),
    enabled: !!decisionId,
  });
}

export function useCreateDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: decisionsService.createDecision,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["decisions"] }),
  });
}
