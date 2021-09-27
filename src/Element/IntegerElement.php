<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

final class IntegerElement extends AbstractElement
{
    private ?int $min = null;
    private ?int $max = null;

    public function setMin(?int $min): self
    {
        $this->min = $min;

        return $this;
    }

    public function setMax(?int $max): self
    {
        $this->max = $max;

        return $this;
    }

    public function render($value): array
    {
        if (null !== $value && !\is_int($value)) {
            $this->throwInvalidValueException();
        }

        return $this->renderBase() + [
            'value' => $value,
            'min' => $this->min,
            'max' => $this->max,
        ];
    }

    protected function getDataType(): string
    {
        return 'integer';
    }
}
